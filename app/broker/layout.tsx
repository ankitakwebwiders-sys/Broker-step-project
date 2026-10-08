'use client'

import { useState } from 'react'
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
import { usePathname } from 'next/navigation'

interface NavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  count?: string
  badge?: string
}

interface NavSectionDef {
  label: string
  items: NavItemDef[]
}

const navSections: NavSectionDef[] = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/broker/dashboard' },
    ],
  },
  {
    label: 'WORKSPACE',
    items: [
      { label: 'Clients', icon: Users, count: '248', href: '/broker/clients' },
      { label: 'Leads', icon: Zap, count: '12', href: '/broker/leads' },
      { label: 'Policies', icon: ClipboardList, href: '/broker/policies' },
      { label: 'Book of Business', icon: BookOpen, href: '/broker/book-of-business' },
      { label: 'Renewals', icon: CalendarDays, count: '8', href: '/broker/renewals' },
    ],
  },
  {
    label: 'COMMISSIONS',
    items: [
      { label: 'Commission Overview', icon: WalletCards, href: '/broker/commissions' },
      { label: 'Statements', icon: FileSpreadsheet, count: '3', href: '/broker/statements' },
      { label: 'Reconciliation', icon: FileCheck2, count: '7', href: '/broker/reconciliation' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { label: 'Reports', icon: FileSpreadsheet, href: '/broker/reports' },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { label: 'Settings', icon: Settings, href: '/broker/settings' },
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
  onClick,
}: {
  item: NavItemDef
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${active
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md shadow-blue-500/25'
        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
        }`}
    >
      <Icon
        className={`size-[18px] shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
          }`}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.count && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${active
            ? 'bg-white/20 text-white font-semibold'
            : 'bg-slate-800 text-slate-300 border border-slate-700/60 group-hover:bg-slate-700/80 group-hover:text-white'
            }`}
        >
          {item.count}
        </span>
      )}
      {item.badge && (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${active
            ? 'bg-white/25 text-white'
            : 'bg-blue-500/15 text-blue-400 border border-blue-400/30'
            }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isItemActive = (href: string) => {
    if (href === '/broker/dashboard') {
      return pathname === '/broker/dashboard' || pathname === '/broker'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-3.5 py-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
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
        <div className="flex flex-1 flex-col space-y-5 overflow-y-auto pr-1 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                {section.label}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    active={isItemActive(item.href)}
                    onClick={() => setMobileOpen(false)}
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
