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
  FileSpreadsheet,
  FileCheck2,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

export interface SubNavItemDef {
  label: string
  href: string
  count?: string
}

export interface NavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  count?: string
  subItems?: SubNavItemDef[]
}

export interface NavSectionDef {
  label: string
  items: NavItemDef[]
}

export const brokerNavSections: NavSectionDef[] = [
  {
    label: 'OVERVIEW',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/broker/dashboard',
        subItems: [
          { label: 'Dashboard / Home', href: '/broker/dashboard' },
        ],
      },
    ],
  },
  {
    label: 'CLIENTS & LEADS',
    items: [
      {
        label: 'Clients',
        icon: Users,
        count: '248',
        href: '/broker/clients',
        subItems: [
          { label: 'All Clients', href: '/broker/clients' },
          { label: 'Active Clients', href: '/broker/clients?tab=Active' },
          { label: 'Inactive Clients', href: '/broker/clients?tab=Inactive' },
          { label: 'Client Details', href: '/broker/clients?view=details' },
          { label: 'Add Client', href: '/broker/clients?action=add' },
        ],
      },
      {
        label: 'Leads',
        icon: Zap,
        count: '12',
        href: '/broker/leads',
        subItems: [
          { label: 'All Leads', href: '/broker/leads' },
          { label: 'New', href: '/broker/leads?tab=New' },
          { label: 'Contacted', href: '/broker/leads?tab=Contacted' },
          { label: 'Follow-Up', href: '/broker/leads?tab=Follow-Up' },
          { label: 'Quoted', href: '/broker/leads?tab=Quoted' },
          { label: 'Won / Converted', href: '/broker/leads?tab=Won' },
          { label: 'Lost', href: '/broker/leads?tab=Lost' },
          { label: 'Not Interested', href: '/broker/leads?tab=Not+Interested' },
          { label: 'Archived', href: '/broker/leads?tab=Archived' },
          { label: 'Lead Details', href: '/broker/leads?view=details' },
          { label: 'My QR Code / Lead Form', href: '/broker/qr-lead-capture' },
        ],
      },
      {
        label: 'Policies',
        icon: ClipboardList,
        href: '/broker/policies',
        subItems: [
          { label: 'All Policies', href: '/broker/policies' },
          { label: 'Active Policies', href: '/broker/policies?tab=active' },
          { label: 'Historical Policies', href: '/broker/policies?tab=historical' },
          { label: 'New Business', href: '/broker/policies?tab=new-business' },
          { label: 'Renewals', href: '/broker/policies?tab=renewals' },
          { label: 'Rewrites', href: '/broker/policies?tab=rewrites' },
          { label: 'Endorsements', href: '/broker/policies?tab=endorsements' },
          { label: 'Cancellations', href: '/broker/policies?tab=cancellations' },
          { label: 'Chargebacks', href: '/broker/policies?tab=chargebacks' },
          { label: 'Adjustments', href: '/broker/policies?tab=adjustments' },
          { label: 'Add Policy', href: '/broker/policies?action=add' },
        ],
      },
      {
        label: 'Book of Business',
        icon: BookOpen,
        href: '/broker/book-of-business',
        subItems: [
          { label: 'Overview', href: '/broker/book-of-business' },
          { label: 'Active Book', href: '/broker/book-of-business?tab=active' },
          { label: 'Historical Book', href: '/broker/book-of-business?tab=historical' },
          { label: 'Import Book of Business', href: '/broker/book-of-business?tab=import' },
          { label: 'Book Analytics', href: '/broker/book-of-business?tab=analytics' },
        ],
      },
    ],
  },
  {
    label: 'COMMISSIONS & RECONCILIATION',
    items: [
      {
        label: 'Commissions',
        icon: WalletCards,
        href: '/broker/commissions',
        subItems: [
          { label: 'Commission Overview', href: '/broker/commissions' },
          { label: 'Expected Commission', href: '/broker/commissions?filter=expected' },
          { label: 'Paid / Actual', href: '/broker/commissions?filter=paid' },
          { label: 'Outstanding', href: '/broker/commissions?filter=outstanding' },
          { label: 'Partial / Short Paid', href: '/broker/commissions?filter=partial' },
          { label: 'Chargebacks', href: '/broker/commissions?filter=chargebacks' },
          { label: 'Adjustments', href: '/broker/commissions?filter=adjustments' },
          { label: 'Commission Transactions', href: '/broker/commissions?view=transactions' },
        ],
      },
      {
        label: 'Statements',
        icon: FileSpreadsheet,
        count: '3',
        href: '/broker/statements',
        subItems: [
          { label: 'All Statements', href: '/broker/statements' },
          { label: 'Upload Statement', href: '/broker/statements?tab=upload' },
          { label: 'Processing', href: '/broker/statements?tab=processing' },
          { label: 'Processed', href: '/broker/statements?tab=processed' },
          { label: 'Matching Results', href: '/broker/statements?tab=matching' },
          { label: 'Statement Details', href: '/broker/statements?tab=details' },
        ],
      },
      {
        label: 'Reconciliation',
        icon: FileCheck2,
        count: '7',
        href: '/broker/reconciliation',
        subItems: [
          { label: 'Overview', href: '/broker/reconciliation' },
          { label: 'Paid / Matched', href: '/broker/reconciliation?tab=paid' },
          { label: 'Partial / Short Paid', href: '/broker/reconciliation?tab=partial' },
          { label: 'Unpaid / Not Found', href: '/broker/reconciliation?tab=unpaid' },
          { label: 'Needs Review', href: '/broker/reconciliation?tab=review' },
          { label: 'Cancellations', href: '/broker/reconciliation?tab=cancellations' },
          { label: 'Chargebacks', href: '/broker/reconciliation?tab=chargebacks' },
          { label: 'Adjustments', href: '/broker/reconciliation?tab=adjustments' },
          { label: 'Overpaid', href: '/broker/reconciliation?tab=overpaid' },
        ],
      },
    ],
  },
  {
    label: 'OPERATIONS & REPORTS',
    items: [
      {
        label: 'Renewals',
        icon: CalendarDays,
        count: '8',
        href: '/broker/renewals',
        subItems: [
          { label: '7 Days', href: '/broker/renewals?horizon=7-days' },
          { label: '30 Days', href: '/broker/renewals?horizon=30-days' },
          { label: '60 Days', href: '/broker/renewals?horizon=60-days' },
          { label: '90 Days', href: '/broker/renewals?horizon=90-days' },
          { label: 'Custom', href: '/broker/renewals?horizon=custom' },
        ],
      },
      {
        label: 'Reports',
        icon: BarChart3,
        href: '/broker/reports',
        subItems: [
          { label: 'Book of Business', href: '/broker/reports?type=book-of-business' },
          { label: 'Production', href: '/broker/reports?type=production' },
          { label: 'Expected Commission', href: '/broker/reports?type=expected-commission' },
          { label: 'Paid / Actual', href: '/broker/reports?type=paid-actual' },
          { label: 'Outstanding', href: '/broker/reports?type=outstanding' },
          { label: 'Partial / Short Paid', href: '/broker/reports?type=partial-short-paid' },
          { label: 'Chargebacks', href: '/broker/reports?type=chargebacks' },
          { label: 'Endorsements', href: '/broker/reports?type=endorsements' },
          { label: 'Cancellations', href: '/broker/reports?type=cancellations' },
          { label: 'Renewals', href: '/broker/reports?type=renewals' },
          { label: 'Net Commission', href: '/broker/reports?type=net-commission' },
          { label: 'Client Commission History', href: '/broker/reports?type=client-commission-history' },
          { label: 'Statement / Reconciliation', href: '/broker/reports?type=statement-reconciliation' },
          { label: 'Lead', href: '/broker/reports?type=lead' },
          { label: 'Marketing Consent', href: '/broker/marketing-consent' },
        ],
      },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        href: '/broker/settings',
        subItems: [
          { label: 'My Profile', href: '/broker/settings' },
          { label: 'Account', href: '/broker/settings?tab=account' },
          { label: 'Membership / Subscription', href: '/broker/membership' },
          { label: 'Carriers', href: '/broker/carriers' },
          { label: 'Commission Settings', href: '/broker/commission-settings' },
          { label: 'Marketing Consent', href: '/broker/marketing-consent' },
          { label: 'QR / Lead Settings', href: '/broker/qr-lead-capture' },
        ],
      },
    ],
  },
]

export function BrokerSidebar({ active, onActiveChange }: { active: string; onActiveChange: (active: string) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [active]: true })

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="mt-8 flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
      {brokerNavSections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.13em] text-slate-400">{section.label}</p>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isItemActive = active === item.label
              const isExpanded = Boolean(expanded[item.label])
              const hasSub = Boolean(item.subItems?.length)

              return (
                <div key={item.label} className="flex flex-col">
                  <div
                    className={`group flex w-full items-center rounded-lg text-left text-[13px] font-medium transition-colors ${
                      isItemActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Link
                      href={item.href}
                      onClick={() => onActiveChange(item.label)}
                      className="flex flex-1 items-center gap-3 px-3 py-2"
                    >
                      <Icon className={`size-[17px] ${isItemActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.count && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            isItemActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>

                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.label)}
                        className="p-2 mr-1 text-slate-400 hover:text-slate-600"
                      >
                        <ChevronDown className={`size-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <div className="ml-5 mt-2.5 mb-1.5 border-l border-slate-200 pl-2.5 flex flex-col space-y-1 pt-1">
                      {item.subItems!.map((sub, subIdx) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              const [targetPath, targetQuery] = sub.href.split('?')
                              if (window.location.pathname === targetPath) {
                                window.history.pushState(null, '', sub.href)
                                window.dispatchEvent(
                                  new CustomEvent('broker-nav-change', {
                                    detail: { href: sub.href, search: targetQuery ? `?${targetQuery}` : '', pathname: targetPath },
                                  })
                                )
                              }
                            }
                          }}
                          className={`px-2.5 py-1 text-[12px] text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-colors ${
                            subIdx === 0 ? 'mt-1.5' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
