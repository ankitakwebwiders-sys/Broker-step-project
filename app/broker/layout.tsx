'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserPlus,
  X,
  Zap,
  Upload,
  List,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavSubItemDef {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface NavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  subItems?: NavSubItemDef[]
}

const navItems: NavItemDef[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/broker/dashboard',
  },
  {
    label: 'Add Client',
    icon: UserPlus,
    href: '/broker/clients',
  },
  {
    label: 'Leads & Marketing',
    icon: Zap,
    href: '/broker/leads',
  },
  {
    label: 'My Book',
    icon: BookOpen,
    href: '/broker/book-of-business',
  },
  {
    label: 'Statement',
    icon: FileSpreadsheet,
    href: '/broker/statements',
    subItems: [
      {
        label: 'Upload New Statement',
        href: '/broker/statements/upload',
        icon: Upload,
      },
      {
        label: 'All Statement',
        href: '/broker/statements',
        icon: List,
      },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/broker/reports',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/broker/settings',
  },
]

function Logo() {
  return (
    <Link href="/broker/dashboard" className="inline-flex items-center transition-opacity hover:opacity-90">
      {/* Light Mode Logo */}
      <Image
        src="/images/logos/broker-logo-removebg-preview.png"
        alt="BrokerStep Logo"
        width={360}
        height={100}
        style={{ width: 'auto' }}
        className="object-contain block dark:hidden"
        priority
      />
      {/* Dark Mode Logo */}
      <Image
        src="/images/logos/broker-dark-theme.png"
        alt="BrokerStep Logo"
        width={360}
        height={100}
        style={{ width: 'auto' }}
        className="object-contain hidden dark:block"
        priority
      />
    </Link>
  )
}

function NavItem({
  item,
  active,
  onClick,
  pathname,
}: {
  item: NavItemDef
  active: boolean
  onClick: () => void
  pathname: string
}) {
  const Icon = item.icon
  const router = useRouter()
  const isLogout = item.label === 'Logout'
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0)
  const isStatement = item.label === 'Statement'
  const isStatementRoute = pathname.startsWith('/broker/statements')

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(() => {
    return isStatement && isStatementRoute
  })

  // Auto-open submenu when visiting statements routes
  useEffect(() => {
    if (isStatement && isStatementRoute) {
      setIsSubmenuOpen(true)
    }
  }, [isStatement, isStatementRoute])

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      setIsSubmenuOpen(true)
    }

    onClick()

    if (isLogout) {
      e.preventDefault()
      router.push('/login')
      return
    }

    const [itemPath, itemQuery] = item.href.split('?')
    if (pathname === itemPath) {
      e.preventDefault()
      window.history.pushState(null, '', item.href)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: item.href, search: itemQuery ? `?${itemQuery}` : '', pathname: itemPath },
        })
      )
    }
  }

  const handleSubClick = () => {
    onClick()
  }

  return (
    <div className="flex flex-col">
      <div className="group relative flex w-full items-center">
        <Link
          href={item.href}
          onClick={handleClick}
          className={`flex flex-1 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${active
            ? 'bg-[#DBEAFE] text-[#246BFD] font-semibold shadow-xs dark:bg-blue-600 dark:text-white'
            : isLogout
              ? 'text-[#64748B] hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400'
              : 'text-[#334155] hover:bg-slate-200/70 hover:text-[#0F172A] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
        >
          <Icon
            className={`size-[18px] shrink-0 transition-colors ${active
              ? 'text-[#246BFD] dark:text-white'
              : isLogout
                ? 'text-[#64748B] group-hover:text-rose-600'
                : 'text-[#64748B] group-hover:text-[#334155] dark:text-slate-400 dark:group-hover:text-white'
              }`}
          />
          <span className="flex-1 truncate tracking-wide">{item.label}</span>
        </Link>

        {hasSubItems && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsSubmenuOpen((prev) => !prev)
            }}
            aria-label="Toggle submenu"
            className={`ml-1 flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${active
              ? 'text-[#246BFD] hover:bg-blue-200/60 dark:text-blue-400 dark:hover:bg-blue-950/60'
              : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''
                }`}
            />
          </button>
        )}
      </div>

      {/* Submenu Items */}
      {hasSubItems && isSubmenuOpen && item.subItems && (
        <div className="mt-1 ml-5 flex flex-col space-y-1 border-l-2 border-slate-200/90 pl-2.5 py-0.5 animate-in fade-in duration-150 dark:border-white/10">
          {item.subItems.map((sub) => {
            const SubIcon = sub.icon
            const isSubActive =
              sub.href === '/broker/statements/upload'
                ? pathname === '/broker/statements/upload'
                : pathname === '/broker/statements'

            return (
              <Link
                key={sub.label}
                href={sub.href}
                onClick={handleSubClick}
                className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${isSubActive
                  ? 'bg-[#246BFD] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
              >
                {SubIcon && (
                  <SubIcon
                    className={`size-3.5 shrink-0 transition-colors ${isSubActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                  />
                )}
                <span className="truncate">{sub.label}</span>
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

  const isItemActive = (item: NavItemDef) => {
    if (item.href === '/login') return false

    if (item.label === 'Dashboard') {
      return (
        pathname === '/broker/dashboard' ||
        pathname === '/broker' ||
        pathname.startsWith('/broker/dashboard/')
      )
    }
    if (item.label === 'Add Client') {
      return pathname === '/broker/clients'
    }
    if (item.label === 'Leads & Marketing') {
      return (
        pathname === '/broker/leads' ||
        pathname === '/broker/marketing-consent' ||
        pathname === '/broker/qr-lead-capture'
      )
    }
    if (item.label === 'My Book') {
      return (
        pathname === '/broker/book-of-business' ||
        pathname === '/broker/active-book' ||
        pathname === '/broker/policies'
      )
    }
    if (item.label === 'Statement') {
      return (
        pathname === '/broker/statements' ||
        pathname.startsWith('/broker/statements/') ||
        pathname === '/broker/reconciliation' ||
        pathname === '/broker/commissions'
      )
    }
    if (item.label === 'Reports') {
      return pathname === '/broker/reports'
    }
    if (item.label === 'Settings') {
      return (
        pathname === '/broker/settings' ||
        [
          '/broker/carriers',
          '/broker/membership',
          '/broker/commission-settings',
          '/broker/renewals',
        ].includes(pathname)
      )
    }
    return pathname === item.href
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200/90 bg-[#F1F5F9] px-3.5 py-4 transition-transform duration-300 ease-in-out lg:translate-x-0 dark:border-white/10 dark:bg-slate-900 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-3">
          <Logo />
          <button
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-200/70 hover:text-[#334155] lg:hidden transition-colors cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Items (No Submenus) */}
        <div className="flex flex-1 flex-col space-y-1.5 overflow-y-auto pr-1 custom-scrollbar pt-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              active={isItemActive(item)}
              onClick={() => setMobileOpen(false)}
              pathname={pathname}
            />
          ))}
        </div>

        {/* Sidebar Footer User Card */}
        <div className="mt-3 pt-3 border-t border-slate-200/90 dark:border-white/10">
          <div className="flex items-center justify-between rounded-xl p-2 text-left transition hover:bg-slate-200/60 dark:hover:bg-slate-800/60">
            <Link href="/broker/settings" className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-xs">
                JD
              </div>
              <div className="truncate">
                <p className="truncate text-sm font-semibold text-[#334155] leading-tight dark:text-white">Jordan Davis</p>
                <p className="truncate text-xs text-[#64748B] leading-tight mt-0.5 dark:text-slate-400">jordan@brokerstep.com</p>
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">

              <Link
                href="/login"
                title="Sign out"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-rose-50 hover:text-rose-600 transition-colors dark:text-slate-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
              >
                <LogOut className="size-4" />
              </Link>
            </div>
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
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-8 dark:border-white/10 dark:bg-slate-900/95">
          {/* Left: Mobile trigger */}
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
          </div>

          {/* Right: Theme Toggle & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            {/* User Profile Pill */}
            <Link
              href="/broker/settings"
              className="group flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 transition-colors hover:bg-slate-100/90 dark:hover:bg-slate-800"
            >
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-xs font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                JD
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                  Jordan Davis
                </p>
                <p className="text-xs font-medium text-slate-500 leading-tight mt-0.5 dark:text-slate-400">
                  Principal Broker · Pro
                </p>
              </div>
              <ChevronDown className="hidden size-3.5 text-slate-400 transition-transform group-hover:translate-y-0.5 sm:block dark:text-slate-500" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
