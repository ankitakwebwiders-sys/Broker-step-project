'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '#platform', label: 'Benefits' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#workflow', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5 lg:px-10">
        {/* Brand Logo */}
        <Link href="/" className="transition-transform hover:scale-105">
          <Image
            src="/images/logos/broker-logo-removebg-preview.png"
            alt="BrokerStep Logo"
            width={220}
            height={60}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-xs md:flex">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions: Login & Sign up (hidden on mobile, visible on md and up) */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-slate-200/90 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-xs transition-all hover:border-[#0170FE]/40 hover:bg-slate-50 hover:text-[#0170FE]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 rounded-full bg-[#0170FE] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition-all hover:bg-[#0061e0] hover:shadow-[0_0_20px_rgba(1,112,254,0.4)]"
          >
            <span className="relative z-10">Sign up</span>
            <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile: Only Hamburger Toggle Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-5 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0170FE] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-[#0170FE] py-2 text-center text-xs font-semibold text-white shadow-sm shadow-[#0170FE]/25 hover:bg-[#0061e0] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
