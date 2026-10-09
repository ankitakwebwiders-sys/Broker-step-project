'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Menu,
  Search,
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
      {/* ───── Admin Sidebar (Broker-Style Dark Aesthetic) ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
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

            {/* Global Search Bar */}
            <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[420px]">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search brokers, carriers, policies, logs..."
                className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 pl-10 pr-4 text-[12.5px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              className="relative hidden sm:flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              aria-label="Help and documentation"
              title="Help & Support"
            >
              <CircleHelp className="size-[18px]" />
            </button>

            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
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

            {/* Admin Profile Pill */}
            <Link
              href="/admin/settings"
              className="group flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100/90"
            >
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-[11px] font-bold text-white shadow-sm ring-1 ring-black/5">
                AD
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[12px] font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                  Admin User
                </p>
                <p className="text-[10px] font-medium text-slate-400 leading-tight">
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
