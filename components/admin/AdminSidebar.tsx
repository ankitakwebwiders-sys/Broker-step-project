'use client'

import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  WalletCards,
  Building2,
  Scale,
  FileText,
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

export function AdminSidebar({ active, onActiveChange }: { active: string; onActiveChange: (active: string) => void }) {
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
    </div>
  )
}
