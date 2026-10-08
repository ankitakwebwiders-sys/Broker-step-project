import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/60 px-6 py-5 backdrop-blur-sm lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Image
          src="/images/logos/broker-logo-removebg-preview.png"
          alt="BrokerStep Logo"
          width={220}
          height={60}
          className="object-contain"
        />
        <p className="text-xs text-slate-500">© 2026 BrokerStep. Insurance, simplified.</p>
      </div>
    </footer>
  )
}
