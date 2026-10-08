'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Zap,
  ClipboardList,
  BookOpen,
  CalendarDays,
  WalletCards,
  Activity,
  FileSpreadsheet,
  FileCheck2,
  BriefcaseBusiness,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

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
      { label: 'Transactions', icon: Activity, href: '/broker/commissions' },
      { label: 'Statements', icon: FileSpreadsheet, count: '3', href: '/broker/statements' },
      { label: 'Reconciliation', icon: FileCheck2, count: '7', href: '/broker/reconciliation' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { label: 'Analytics', icon: BriefcaseBusiness, href: '/broker/analytics' },
      { label: 'Reports', icon: FileSpreadsheet, href: '/broker/reports' },
    ],
  },
]

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
      {item.count && (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {item.count}
        </span>
      )}
    </Link>
  )
}

export function BrokerSidebar({ active, onActiveChange }: { active: string; onActiveChange: (active: string) => void }) {
  return (
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
                onClick={() => onActiveChange(item.label)}
              />
            ))}
          </div>
        </div>
      ))}
      <div>
        <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.13em] text-slate-400">CONFIGURATION</p>
        <NavItem
          item={{ label: 'Settings', icon: Settings, href: '/broker/settings' }}
          active={active === 'Settings'}
          onClick={() => onActiveChange('Settings')}
        />
      </div>
    </div>
  )
}
