'use client'

import {
  LayoutDashboard,
  UserPlus,
  Zap,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface NavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export const brokerNavItems: NavItemDef[] = [
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

export function BrokerSidebar({
  active,
  onActiveChange,
}: {
  active: string
  onActiveChange: (active: string) => void
}) {
  const router = useRouter()

  return (
    <div className="mt-4 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
      {brokerNavItems.map((item) => {
        const Icon = item.icon
        const isItemActive = active === item.label
        const isLogout = item.label === 'Logout'

        const handleClick = (e: React.MouseEvent) => {
          onActiveChange(item.label)
          if (isLogout) {
            e.preventDefault()
            router.push('/login')
          }
        }

        return (
          <div key={item.label} className="flex flex-col">
            <Link
              href={item.href}
              onClick={handleClick}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${isItemActive
                ? 'bg-[#DBEAFE] text-[#246BFD] font-semibold shadow-xs'
                : isLogout
                  ? 'text-[#64748B] hover:bg-rose-50 hover:text-rose-600'
                  : 'text-[#334155] hover:bg-slate-200/70 hover:text-[#0F172A]'
                }`}
            >
              <Icon
                className={`size-[18px] shrink-0 transition-colors ${isItemActive
                  ? 'text-[#246BFD]'
                  : isLogout
                    ? 'text-[#64748B] group-hover:text-rose-600'
                    : 'text-[#64748B] group-hover:text-[#334155]'
                  }`}
              />
              <span className="flex-1 truncate tracking-wide">{item.label}</span>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
