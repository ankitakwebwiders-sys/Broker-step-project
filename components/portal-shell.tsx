'use client'

import Link from 'next/link'
import { ArrowRight, Bell, ChevronRight, CircleHelp, LayoutDashboard, Menu, Search, ShieldCheck, Users, X } from 'lucide-react'
import { useState } from 'react'

const brokerNav = ['dashboard','clients','leads','policies','book-of-business','renewals','commissions','statements','reconciliation','analytics','reports','carriers','commission-settings','qr-lead-capture','marketing-consent','membership','settings']
const adminNav = ['dashboard','brokers','memberships','subscriptions','payments','carriers','commission-config','statement-templates','field-mappings','notifications','audit-logs','settings']
const labels: Record<string,string> = {'book-of-business':'Book of business','qr-lead-capture':'QR lead capture','marketing-consent':'Marketing consent','commission-settings':'Commission settings','commission-config':'Commission config','statement-templates':'Statement templates','field-mappings':'Field mappings','audit-logs':'Audit logs'}
const titleize = (value:string) => labels[value] || value.split('-').map((word) => word[0].toUpperCase()+word.slice(1)).join(' ')

export function PortalShell({ type='broker', active='dashboard', children }:{type?:'broker'|'admin';active?:string;children:React.ReactNode}) {
  const [open,setOpen] = useState(false)
  const nav = type === 'admin' ? adminNav : brokerNav
  const base = type === 'admin' ? '/admin' : '/broker'
  return <div className="min-h-screen bg-[#f5f8fc] text-slate-950">
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-5 transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex items-center justify-between mb-8"><Link href="/" className="text-lg font-bold tracking-tight">Broker<span className="text-indigo-600">Step</span></Link><button onClick={()=>setOpen(false)} className="lg:hidden"><X className="size-5"/></button></div>
      <div className="mb-5 rounded-xl bg-indigo-50 px-3 py-3 text-xs text-indigo-900"><div className="font-semibold">{type==='admin'?'Admin console':'Broker workspace'}</div><div className="mt-1 text-indigo-600">{type==='admin'?'Platform operations':'Jordan Davis · Pro plan'}</div></div>
      <nav className="flex flex-col gap-1">{nav.map((item)=><Link key={item} href={`${base}/${item}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active===item?'bg-indigo-600 font-medium text-white':'text-slate-600 hover:bg-slate-100'}`}><LayoutDashboard className="size-4"/>{titleize(item)}</Link>)}</nav>
    </aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8"><button onClick={()=>setOpen(true)} className="lg:hidden"><Menu className="size-5"/></button><div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><Search className="size-4"/>Search anything</div><div className="flex items-center gap-5"><Bell className="size-5 text-slate-500"/><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">JD</div><span className="hidden text-sm font-medium sm:block">Jordan Davis</span></div></div></header><main className="p-5 lg:p-8">{children}</main></div>
  </div>
}

export function PortalPage({type='broker',active,title,eyebrow,description,children}:{type?:'broker'|'admin';active:string;title:string;eyebrow?:string;description?:string;children?:React.ReactNode}) { return <PortalShell type={type} active={active}><div className="mx-auto max-w-7xl"><div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">{eyebrow||'Workspace'}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>}</div><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">{active==='dashboard'?'View report':'Add new'}<ArrowRight className="size-4"/></button></div>{children||<div className="grid gap-5 md:grid-cols-3"><Metric label="Active records" value="248" trend="+12.4%"/><Metric label="This month" value="$84,620" trend="+8.2%"/><Metric label="Attention needed" value="14" trend="Review queue"/></div>}</div></PortalShell> }
export function Metric({label,value,trend}:{label:string;value:string;trend:string}) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p></div> }
export function DataCard({title,items=['New opportunity','Pending renewal','Commission statement']}) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><CircleHelp className="size-4 text-slate-400"/></div><div className="flex flex-col gap-3">{items.map((item)=><div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm"><span>{item}</span><ChevronRight className="size-4 text-slate-400"/></div>)}</div></div> }
export function LandingFrame({children}:{children:React.ReactNode}) { return <div className="min-h-screen bg-[#0b1220] text-white">{children}</div> }
