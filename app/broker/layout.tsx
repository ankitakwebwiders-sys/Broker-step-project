'use client'

import { useState, useEffect } from 'react'
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'


interface SubNavItemDef {
  label: string
  href: string
  count?: string
  badge?: string
}

interface NavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  count?: string
  badge?: string
  subItems?: SubNavItemDef[]
}

interface NavSectionDef {
  label: string
  items: NavItemDef[]
}

const navSections: NavSectionDef[] = [
  {
    label: 'OVERVIEW',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/broker/dashboard',
        subItems: [
          { label: 'Dashboard / Home', href: '/broker/dashboard' },
        ],
      },
    ],
  },
  {
    label: 'CLIENTS & LEADS',
    items: [
      {
        label: 'Clients',
        icon: Users,
        count: '248',
        href: '/broker/clients',
        subItems: [
          { label: 'All Clients', href: '/broker/clients' },
          { label: 'Active Clients', href: '/broker/clients?tab=Active' },
          { label: 'Inactive Clients', href: '/broker/clients?tab=Inactive' },
          { label: 'Client Details', href: '/broker/clients?view=details' },
          { label: 'Add Client', href: '/broker/clients?action=add' },
        ],
      },
      {
        label: 'Leads',
        icon: Zap,
        count: '12',
        href: '/broker/leads',
        subItems: [
          { label: 'All Leads', href: '/broker/leads' },
          { label: 'New', href: '/broker/leads?tab=New' },
          { label: 'Contacted', href: '/broker/leads?tab=Contacted' },
          { label: 'Follow-Up', href: '/broker/leads?tab=Follow-Up' },
          { label: 'Quoted', href: '/broker/leads?tab=Quoted' },
          { label: 'Won / Converted', href: '/broker/leads?tab=Won' },
          { label: 'Lost', href: '/broker/leads?tab=Lost' },
          { label: 'Not Interested', href: '/broker/leads?tab=Not+Interested' },
          { label: 'Archived', href: '/broker/leads?tab=Archived' },
          { label: 'Lead Details', href: '/broker/leads?view=details' },
          { label: 'My QR Code / Lead Form', href: '/broker/qr-lead-capture' },
        ],
      },
      {
        label: 'Policies',
        icon: ClipboardList,
        href: '/broker/policies',
        subItems: [
          { label: 'All Policies', href: '/broker/policies' },
          { label: 'Active Policies', href: '/broker/policies?tab=active' },
          { label: 'Historical Policies', href: '/broker/policies?tab=historical' },
          { label: 'New Business', href: '/broker/policies?tab=new-business' },
          { label: 'Renewals', href: '/broker/policies?tab=renewals' },
          { label: 'Rewrites', href: '/broker/policies?tab=rewrites' },
          { label: 'Endorsements', href: '/broker/policies?tab=endorsements' },
          { label: 'Cancellations', href: '/broker/policies?tab=cancellations' },
          { label: 'Chargebacks', href: '/broker/policies?tab=chargebacks' },
          { label: 'Adjustments', href: '/broker/policies?tab=adjustments' },
          { label: 'Add Policy', href: '/broker/policies?action=add' },
        ],
      },
      {
        label: 'Book of Business',
        icon: BookOpen,
        href: '/broker/book-of-business',
        subItems: [
          { label: 'Overview', href: '/broker/book-of-business' },
          { label: 'Active Book', href: '/broker/book-of-business?tab=active' },
          { label: 'Historical Book', href: '/broker/book-of-business?tab=historical' },
          { label: 'Import Book of Business', href: '/broker/book-of-business?tab=import' },
          { label: 'Book Analytics', href: '/broker/book-of-business?tab=analytics' },
        ],
      },
    ],
  },
  {
    label: 'COMMISSIONS & RECONCILIATION',
    items: [
      {
        label: 'Commissions',
        icon: WalletCards,
        href: '/broker/commissions',
        subItems: [
          { label: 'Commission Overview', href: '/broker/commissions' },
          { label: 'Expected Commission', href: '/broker/commissions?filter=expected' },
          { label: 'Paid / Actual', href: '/broker/commissions?filter=paid' },
          { label: 'Outstanding', href: '/broker/commissions?filter=outstanding' },
          { label: 'Partial / Short Paid', href: '/broker/commissions?filter=partial' },
          { label: 'Chargebacks', href: '/broker/commissions?filter=chargebacks' },
          { label: 'Adjustments', href: '/broker/commissions?filter=adjustments' },
          { label: 'Commission Transactions', href: '/broker/commissions?view=transactions' },
        ],
      },
      {
        label: 'Statements',
        icon: FileSpreadsheet,
        count: '3',
        href: '/broker/statements',
        subItems: [
          { label: 'All Statements', href: '/broker/statements' },
          { label: 'Upload Statement', href: '/broker/statements?tab=upload' },
          { label: 'Processing', href: '/broker/statements?tab=processing' },
          { label: 'Processed', href: '/broker/statements?tab=processed' },
          { label: 'Matching Results', href: '/broker/statements?tab=matching' },
          { label: 'Statement Details', href: '/broker/statements?tab=details' },
        ],
      },
      {
        label: 'Reconciliation',
        icon: FileCheck2,
        count: '7',
        href: '/broker/reconciliation',
        subItems: [
          { label: 'Overview', href: '/broker/reconciliation' },
          { label: 'Paid / Matched', href: '/broker/reconciliation?tab=paid' },
          { label: 'Partial / Short Paid', href: '/broker/reconciliation?tab=partial' },
          { label: 'Unpaid / Not Found', href: '/broker/reconciliation?tab=unpaid' },
          { label: 'Needs Review', href: '/broker/reconciliation?tab=review' },
          { label: 'Cancellations', href: '/broker/reconciliation?tab=cancellations' },
          { label: 'Chargebacks', href: '/broker/reconciliation?tab=chargebacks' },
          { label: 'Adjustments', href: '/broker/reconciliation?tab=adjustments' },
          { label: 'Overpaid', href: '/broker/reconciliation?tab=overpaid' },
        ],
      },
    ],
  },
  {
    label: 'OPERATIONS & REPORTS',
    items: [
      {
        label: 'Renewals',
        icon: CalendarDays,
        count: '8',
        href: '/broker/renewals',
        subItems: [
          { label: '7 Days', href: '/broker/renewals?horizon=7-days' },
          { label: '30 Days', href: '/broker/renewals?horizon=30-days' },
          { label: '60 Days', href: '/broker/renewals?horizon=60-days' },
          { label: '90 Days', href: '/broker/renewals?horizon=90-days' },
          { label: 'Custom', href: '/broker/renewals?horizon=custom' },
        ],
      },
      {
        label: 'Reports',
        icon: BarChart3,
        href: '/broker/reports',
        subItems: [
          { label: 'Book of Business', href: '/broker/reports?type=book-of-business' },
          { label: 'Production', href: '/broker/reports?type=production' },
          { label: 'Expected Commission', href: '/broker/reports?type=expected-commission' },
          { label: 'Paid / Actual', href: '/broker/reports?type=paid-actual' },
          { label: 'Outstanding', href: '/broker/reports?type=outstanding' },
          { label: 'Partial / Short Paid', href: '/broker/reports?type=partial-short-paid' },
          { label: 'Chargebacks', href: '/broker/reports?type=chargebacks' },
          { label: 'Endorsements', href: '/broker/reports?type=endorsements' },
          { label: 'Cancellations', href: '/broker/reports?type=cancellations' },
          { label: 'Renewals', href: '/broker/reports?type=renewals' },
          { label: 'Net Commission', href: '/broker/reports?type=net-commission' },
          { label: 'Client Commission History', href: '/broker/reports?type=client-commission-history' },
          { label: 'Statement / Reconciliation', href: '/broker/reports?type=statement-reconciliation' },
          { label: 'Lead', href: '/broker/reports?type=lead' },
          { label: 'Marketing Consent', href: '/broker/marketing-consent' },
        ],
      },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        href: '/broker/settings',
        subItems: [
          { label: 'My Profile', href: '/broker/settings' },
          { label: 'Account', href: '/broker/settings?tab=account' },
          { label: 'Membership / Subscription', href: '/broker/membership' },
          { label: 'Carriers', href: '/broker/carriers' },
          { label: 'Commission Settings', href: '/broker/commission-settings' },
          { label: 'Marketing Consent', href: '/broker/marketing-consent' },
          { label: 'QR / Lead Settings', href: '/broker/qr-lead-capture' },
        ],
      },
    ],
  },
]

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-90">
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
  item: NavItemDef
  active: boolean
  expanded: boolean
  onToggleExpand: () => void
  onClick: () => void
  currentSearch: string
  pathname: string
  onCloseMobile: () => void
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
    onClick()

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
    onCloseMobile()
    const [subPath, subQuery] = subHref.split('?')
    const targetSearch = subQuery ? `?${subQuery}` : ''

    if (pathname === subPath) {
      // Same page: instant 1-click navigation without reload or router lag
      e.preventDefault()
      window.history.pushState(null, '', subHref)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: subHref, search: targetSearch, pathname: subPath },
        })
      )
    } else {
      // Navigate to target route
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
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
        }`}
      >
        <Link
          href={item.href}
          onClick={handleParentClick}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 text-[13px] font-medium"
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

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const [currentSearch, setCurrentSearch] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const section of navSections) {
      for (const item of section.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + '/') ||
          (item.href === '/broker/settings' &&
            ['/broker/carriers', '/broker/membership', '/broker/commission-settings', '/broker/marketing-consent', '/broker/qr-lead-capture'].includes(pathname))
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
    for (const section of navSections) {
      for (const item of section.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + '/') ||
          (item.href === '/broker/settings' &&
            ['/broker/carriers', '/broker/membership', '/broker/commission-settings', '/broker/marketing-consent', '/broker/qr-lead-capture'].includes(pathname))
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
    if (href === '/broker/dashboard') {
      return pathname === '/broker/dashboard' || pathname === '/broker'
    }
    if (href === '/broker/settings') {
      return (
        pathname === '/broker/settings' ||
        ['/broker/carriers', '/broker/membership', '/broker/commission-settings', '/broker/marketing-consent', '/broker/qr-lead-capture'].includes(pathname)
      )
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-3.5 py-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-3">
          <Logo />
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-1 flex-col space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {navSections.map((section) => (
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
                    onClick={() => setMobileOpen(false)}
                    currentSearch={currentSearch}
                    pathname={pathname}
                    onCloseMobile={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Card */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between rounded-xl p-2 text-left transition hover:bg-white/[0.05]">
            <Link href="/broker/settings" className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                JD
              </div>
              <div className="truncate">
                <p className="truncate text-[12px] font-semibold text-slate-200 leading-tight">Jordan Davis</p>
                <p className="truncate text-[10px] text-slate-400 leading-tight">jordan@brokerstep.com</p>
              </div>
            </Link>
            <Link
              href="/login"
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      {/* ───── Main App Area ───── */}
      <div className="lg:pl-[280px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-8">
          {/* Left: Mobile trigger & Search */}
          <div className="flex flex-1 items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[420px]">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search clients, policies, statements..."
                className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 pl-10 pr-12 text-[12.5px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
              />

            </div>
          </div>

          {/* Right: Quick Action, Help, Notifications & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Help Button */}
            <button
              type="button"
              className="relative hidden sm:flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Help and documentation"
              title="Help & Support"
            >
              <CircleHelp className="size-[18px]" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="size-[18px]" />
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </span>
            </button>

            <div className="h-6 w-px bg-slate-200/90 mx-0.5" />

            {/* User Profile Pill */}
            <Link
              href="/broker/settings"
              className="group flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100/90"
            >
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-[11px] font-bold text-white shadow-sm ring-1 ring-black/5">
                JD
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[12px] font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                  Jordan Davis
                </p>
                <p className="text-[10px] font-medium text-slate-400 leading-tight">
                  Principal Broker · Pro
                </p>
              </div>
              <ChevronDown className="hidden size-3.5 text-slate-400 transition-transform group-hover:translate-y-0.5 sm:block" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
