'use client'

export default function Page() {
  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
          Platform Settings
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">
          Global platform configuration, security policies, and administrative preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
          <span className="text-xl font-bold">⚙</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Module Under Active Configuration</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          This administration module is actively being configured for platform deployment.
        </p>
      </div>
    </div>
  )
}
