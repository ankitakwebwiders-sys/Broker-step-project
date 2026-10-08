'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react'
import { dashboardStats } from '@/data/broker/stats'
import { upcomingRenewals } from '@/data/broker/renewals'

const activities = [
  { title: 'Commission payment matched', detail: 'Travelers · Statement #ST-2841', time: '18 min ago', icon: FileCheck2, tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  { title: 'New lead captured', detail: 'Maya Patel · Commercial Property', time: '1 hr ago', icon: Users, tone: 'bg-blue-50 text-blue-600 ring-blue-100' },
  { title: 'Policy endorsement added', detail: 'Northstar Logistics · #POL-8842', time: '3 hrs ago', icon: ClipboardList, tone: 'bg-violet-50 text-violet-600 ring-violet-100' },
  { title: 'Statement ready for review', detail: 'AIG · September 2026', time: 'Yesterday', icon: FileSpreadsheet, tone: 'bg-amber-50 text-amber-600 ring-amber-100' },
]

function StatCard({ stat }: { stat: (typeof dashboardStats)[number] }) {
  const toneClasses =
    stat.tone === 'green' || stat.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
    : stat.tone === 'amber' ? 'bg-amber-50 text-amber-600 ring-amber-100'
    : stat.tone === 'violet' ? 'bg-violet-50 text-violet-600 ring-violet-100'
    : stat.tone === 'rose' ? 'bg-rose-50 text-rose-600 ring-rose-100'
    : 'bg-blue-50 text-blue-600 ring-blue-100'

  return (
    <Link href={stat.link || '#'} className="group">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-medium text-slate-500">{stat.label}</p>
          <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ${toneClasses}`}>
            {stat.tone === 'amber' ? 'Healthy' : '↑ ' + stat.change}
          </span>
        </div>
        <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{stat.value}</p>
        <p className="mt-1 text-[11px] text-slate-400">{stat.tone === 'amber' ? stat.change + ' ' + stat.note : stat.note}</p>
      </div>
    </Link>
  )
}

export default function BrokerDashboardPage() {
  const [range, setRange] = useState('Last 12 months')
  const [search, setSearch] = useState('')

  return (
    <div className="p-5 sm:p-8">
      <div className="mx-auto max-w-[1480px]">

        {/* ───── Header ───── */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Tuesday, October 7, 2026
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
              Good morning, Jordan
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Here&apos;s what&apos;s happening with your book today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex">
              <CalendarDays className="size-4 text-slate-400" />
              This year
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
            <button className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)]">
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Add new
            </button>
          </div>
        </div>

        {/* ───── Stat Cards ───── */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
        </div>

        {/* ───── Chart + Activity ───── */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">

          {/* Production & Commission Trend Chart */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Production &amp; Commission Trend</h2>
                <p className="mt-1 text-[11px] text-slate-400">Track your book&apos;s performance over time</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="size-2 rounded-full bg-blue-600" /> Production
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="size-2 rounded-full bg-violet-400" /> Commission
                </div>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option>Last 12 months</option>
                  <option>Last 6 months</option>
                  <option>This year</option>
                </select>
              </div>
            </div>

            <div className="mt-7 flex h-[220px] items-end gap-2 border-b border-l border-slate-100 px-3 pb-0 pt-4 sm:gap-4 sm:px-5">
              <div className="flex h-full flex-col justify-between pb-1 pr-2 text-[10px] text-slate-400">
                <span>$400k</span>
                <span>$300k</span>
                <span>$200k</span>
                <span>$100k</span>
                <span>$0</span>
              </div>
              <div className="flex h-full flex-1 items-end justify-between gap-1.5 sm:gap-3">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => (
                  <div key={month} className="group/bar flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full items-end justify-center gap-0.5">
                      <div
                        className="w-1/2 rounded-t-[3px] bg-blue-600/90 transition-all duration-300 group-hover/bar:bg-blue-600"
                        style={{ height: `${38 + [8, 17, 28, 23, 42, 48, 57, 60, 68, 74, 82, 90][i]}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t-[3px] bg-violet-300 transition-all duration-300 group-hover/bar:bg-violet-400"
                        style={{ height: `${22 + [5, 13, 18, 20, 30, 34, 38, 40, 44, 51, 57, 64][i]}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 transition group-hover/bar:text-slate-600">{month}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Recent activity</h2>
                <p className="mt-1 text-[11px] text-slate-400">Latest updates across your book</p>
              </div>
              <button className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline underline-offset-4">
                View all
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {activities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.title} className="group flex items-start gap-3 rounded-lg p-1.5 transition hover:bg-slate-50">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${activity.tone}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-700">{activity.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{activity.detail}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* ───── Leads Requiring Attention ───── */}
        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Leads Requiring Attention</h2>
              <p className="mt-1 text-[11px] text-slate-400">Leads that need follow-up or response</p>
            </div>
            <Link href="/broker/leads" className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Days Since Contact</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Maya Patel', type: 'Commercial Property', status: 'Hot Lead', days: '3' },
                  { name: 'Tech Solutions Inc', type: 'Business Owners', status: 'Follow-up', days: '7' },
                  { name: 'Green Valley Farms', type: 'Farm & Ranch', status: 'Cold Lead', days: '14' },
                ].map((lead) => (
                  <tr key={lead.name} className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="text-[12px] font-semibold text-slate-700">{lead.name}</p>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">{lead.type}</td>
                    <td className="px-3 py-3">
                      <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ${
                        lead.status === 'Hot Lead' ? 'bg-rose-50 text-rose-600 ring-rose-100'
                        : lead.status === 'Follow-up' ? 'bg-amber-50 text-amber-600 ring-amber-100'
                        : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">{lead.days}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href="/broker/leads" className="text-[11px] font-medium text-blue-600 transition hover:text-blue-700 hover:underline underline-offset-4">
                        Follow up
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ───── Records Requiring Reconciliation ───── */}
        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Records Requiring Reconciliation</h2>
              <p className="mt-1 text-[11px] text-slate-400">Statements that need review and matching</p>
            </div>
            <Link href="/broker/reconciliation" className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { carrier: 'Travelers', period: 'September 2026', status: 'Pending Review', priority: 'High' },
              { carrier: 'AIG', period: 'September 2026', status: 'Discrepancy Found', priority: 'Medium' },
              { carrier: 'Chubb', period: 'August 2026', status: 'Ready to Reconcile', priority: 'Low' },
            ].map((record) => (
              <div key={record.carrier} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md cursor-pointer">
                <div className={`flex size-9 items-center justify-center rounded-lg ring-1 ${
                  record.priority === 'High' ? 'bg-rose-100 text-rose-600 ring-rose-200'
                  : record.priority === 'Medium' ? 'bg-amber-100 text-amber-600 ring-amber-200'
                  : 'bg-emerald-100 text-emerald-600 ring-emerald-200'
                }`}>
                  <FileCheck2 className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-slate-700">{record.carrier}</p>
                  <p className="text-[10px] text-slate-500">{record.period}</p>
                </div>
                <span className={`text-[10px] font-semibold ${
                  record.status === 'Pending Review' ? 'text-rose-600'
                  : record.status === 'Discrepancy Found' ? 'text-amber-600'
                  : 'text-emerald-600'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ───── Pending Work ───── */}
        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Pending Work</h2>
              <p className="mt-1 text-[11px] text-slate-400">Tasks that require your attention</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { task: 'Approve Renewals', count: 8, link: '/broker/renewals', color: 'blue' },
              { task: 'Review Statements', count: 3, link: '/broker/statements', color: 'violet' },
              { task: 'Follow-up Leads', count: 12, link: '/broker/leads', color: 'amber' },
              { task: 'Update Client Info', count: 5, link: '/broker/clients', color: 'emerald' },
            ].map((item) => (
              <Link
                key={item.task}
                href={item.link}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <div className={`flex size-9 items-center justify-center rounded-lg ring-1 ${
                  item.color === 'blue' ? 'bg-blue-100 text-blue-600 ring-blue-200'
                  : item.color === 'violet' ? 'bg-violet-100 text-violet-600 ring-violet-200'
                  : item.color === 'amber' ? 'bg-amber-100 text-amber-600 ring-amber-200'
                  : 'bg-emerald-100 text-emerald-600 ring-emerald-200'
                }`}>
                  <Activity className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-slate-700">{item.task}</p>
                  <p className="text-[10px] text-slate-500">{item.count} pending</p>
                </div>
                <ArrowUpRight className="size-4 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </Link>
            ))}
          </div>
        </section>

        {/* ───── Renewals + Quick Actions ───── */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Upcoming renewals</h2>
                <p className="mt-1 text-[11px] text-slate-400">8 policies renewing in the next 30 days</p>
              </div>
              <button className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline underline-offset-4">
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Client</th>
                    <th className="px-3 py-3">Renewal date</th>
                    <th className="px-3 py-3">Premium</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {upcomingRenewals.map((row) => (
                    <tr key={row.client} className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-8 items-center justify-center rounded-lg text-[10px] font-bold ring-1 ring-black/5 ${row.color}`}>
                            {row.initials}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-slate-700">{row.client}</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">{row.type} · {row.carrier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-slate-600">{row.date}</td>
                      <td className="px-3 py-3 text-[11px] font-semibold text-slate-700">{row.premium}</td>
                      <td className="px-3 py-3">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ${
                          row.status === 'On track'
                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                            : 'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600">
                          <Zap className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Quick actions</h2>
                <p className="mt-1 text-[11px] text-slate-400">Common tasks at your fingertips</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <button className="group flex items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <Plus className="size-4 transition-transform group-hover:rotate-90" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-800">Add a client</p>
                  <p className="text-[10px] text-slate-500">Create a new client record</p>
                </div>
                <ArrowUpRight className="ml-auto size-4 text-blue-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <button className="group flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FileSpreadsheet className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-800">Upload statement</p>
                  <p className="text-[10px] text-slate-500">Reconcile commissions faster</p>
                </div>
                <ArrowUpRight className="ml-auto size-4 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </button>
              <button className="group flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-800">Review renewals</p>
                  <p className="text-[10px] text-slate-500">Stay ahead of your book</p>
                </div>
                <ArrowDownRight className="ml-auto size-4 text-slate-400 transition-all group-hover:translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}