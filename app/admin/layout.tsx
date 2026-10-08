'use client'

import { useState } from 'react'
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
  FileText,
  CreditCard,
  Building2,
  Scale,
  ClipboardList,
  BellRing,
  FileSearch,
  Cog,
} from 'lucide-react'
import Link from 'next/link'

const navSections = [
  { label: 'DASHBOARD', items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }] },
  {
    label: 'MANAGEMENT',
    items: [
      { label: 'Brokers', icon: Users, href: '/admin/brokers' },
      { label: 'Memberships', icon: ShieldCheck, href: '/admin/memberships' },
      { label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
      { label: 'Payments', icon: WalletCards, href: '/admin/payments' },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { label: 'Carriers', icon: Building2, href: '/admin/carriers' },
      { label: 'Commission Config', icon: Scale, href: '/admin/commission-config' },
      { label: 'Statement Templates', icon: FileText, href: '/admin/statement-templates' },
      { label: 'Field Mappings', icon: ClipboardList, href: '/admin/field-mappings' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Notifications', icon: BellRing, href: '/admin/notifications' },
      { label: 'Audit Logs', icon: FileSearch, href: '/admin/audit-logs' },
      { label: 'Settings', icon: Cog, href: '/admin/settings' },
    ],
  },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
        <ShieldCheck className="size-5" strokeWidth={2.5} />
      </div>
      <span className="text-[17px] font-bold tracking-[-0.03em] text-slate-900">
        Broker<span className="text-blue-600">Step</span>
      </span>
    </Link>
  )
}

function NavItem({ item, active, onClick }: { item: (typeof navSections)[number]['items'][number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`size-[17px] ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            className="rounded-lg p-1 text-slate-400 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.13em] text-slate-400">{section.label}</p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    active={active === item.label}
                    onClick={() => {
                      setActive(item.label)
                      setMobileOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-slate-800">Admin User</p>
              <p className="truncate text-[11px] text-slate-400">System Administrator</p>
            </div>
            <MoreHorizontal className="size-4 text-slate-400" />
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur sm:px-8">
          <button
            className="rounded-lg p-2 text-slate-500 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <div className="relative max-w-[330px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12px] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-50 sm:flex">
              <CircleHelp className="size-4" /> Help
            </button>
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label="Notifications">
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-slate-50">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                AD
              </div>
              <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" />
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
