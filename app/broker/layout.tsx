'use client'

import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const navSections = [
  { label: 'DASHBOARD', items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/broker/dashboard' }] },
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
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/images/logos/broker-dark-theme.png"
        alt="BrokerStep Logo"
        width={220}
        height={60}
        className="object-contain"
      />
    </Link>
  )
}

function NavItem({ item, active, onClick }: { item: (typeof navSections)[number]['items'][number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className={`size-5 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.count && (
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
          }`}
        >
          {item.count}
        </span>
      )}
      {active && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ArrowUpRight className="size-4 text-white/70" />
        </div>
      )}
    </Link>
  )
}

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <Logo />
            <button
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 lg:hidden transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-8 overflow-y-auto custom-scrollbar">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="mb-4 px-4 text-[11px] font-bold tracking-[0.2em] text-slate-500">{section.label}</p>
                <div className="flex flex-col gap-2">
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
            <div>
              <p className="mb-4 px-4 text-[11px] font-bold tracking-[0.2em] text-slate-500">CONFIGURATION</p>
              <NavItem
                item={{ label: 'Settings', icon: Settings, href: '/broker/settings' }}
                active={active === 'Settings'}
                onClick={() => setActive('Settings')}
              />
            </div>
          </div>
        
        </aside>
        {mobileOpen && (
          <button
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}
        <div className="lg:pl-[280px]">
          <header className="sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur sm:px-8">
            <button
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="relative max-w-[330px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search clients, policies, statements..."
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
                  JD
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
