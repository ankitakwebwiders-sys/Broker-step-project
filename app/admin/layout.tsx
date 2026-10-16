'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {

  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Render standalone full-screen layout for admin login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* ───── Admin Sidebar (Soft Blue-Grey #F1F5F9 Aesthetic) ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      {/* ───── Main Admin Content Area ───── */}
      <div className="lg:pl-[280px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>

          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">



            {/* Admin Profile Pill */}
            <Link
              href="/admin/settings"
              className="group flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100/90"
            >
              <div className="relative flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-xs font-bold text-white shadow-sm ring-1 ring-black/5">
                AD
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                  Admin User
                </p>
                <p className="text-xs font-medium text-slate-400 leading-tight mt-0.5">
                  System Administrator
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
