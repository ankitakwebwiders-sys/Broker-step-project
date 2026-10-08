'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-10">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image
            src="/images/logos/broker-logo-removebg-preview.png"
            alt="BrokerStep Logo"
            width={220}
            height={60}
            className="object-contain"
          />
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm md:flex">
          {[
            { href: '#platform', label: 'Benefits' },
            { href: '#features', label: 'Features' },
            { href: '#workflow', label: 'How It Works' },
            { href: '#pricing', label: 'Pricing' },
          ].map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:block">
            Login
          </Link>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            <span className="relative z-10">Sign up</span>
            <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
