import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/70 px-6 py-5 backdrop-blur-md lg:px-10 dark:bg-[#0d131f]/95 dark:border-[#1e293b]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="transition-transform hover:scale-105">
          {/* Light Mode Logo */}
          <Image
            src="/images/logos/broker-logo-removebg-preview.png"
            alt="BrokerStep Logo"
            width={200}
            height={55}
            className="object-contain block dark:hidden"
          />
          {/* Dark Mode Logo */}
          <Image
            src="/images/logos/broker-dark-theme.png"
            alt="BrokerStep Logo"
            width={200}
            height={55}
            className="object-contain hidden dark:block"
          />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <Link href="/contact" className="transition-colors hover:text-[#0170FE] dark:hover:text-[#0170FE]">
            Contact Us
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[#0170FE] dark:hover:text-[#0170FE]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-[#0170FE] dark:hover:text-[#0170FE]">
            Terms of Service
          </Link>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 BrokerStep. Insurance, simplified.</p>
      </div>
    </footer>
  )
}

