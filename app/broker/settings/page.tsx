'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  ShieldCheck,
  Award,
  Sliders,
  FileCheck2,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  AlertCircle,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
  Calendar,
  DollarSign,
  Share2,
  Percent,
  Laptop,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Save,
  HelpCircle,
  X,
  Send,
  FileText,
  CheckSquare,
  Square,
  Fingerprint,
  Clock,
  Sparkles,
  Trash2,
  Pencil,
  RotateCcw,
} from 'lucide-react'

// Tabs definition
type TabId =
  | 'profile'
  | 'account'
  | 'membership'
  | 'commissions'
  | 'consent'
  | 'qr-leads'

interface TabDef {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const TABS: TabDef[] = [
  { id: 'profile', label: 'My Profile', icon: User, badge: 'Verified' },
  { id: 'account', label: 'Account', icon: ShieldCheck },
  { id: 'membership', label: 'Membership / Subscription', icon: Award, badge: 'Pro' },
  { id: 'commissions', label: 'Commission Settings', icon: Sliders },
  { id: 'consent', label: 'Marketing Consent', icon: FileCheck2, badge: 'Compliant' },
  { id: 'qr-leads', label: 'QR / Lead Settings', icon: QrCode, badge: 'Active' },
]

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') as TabId | null
  const initialTab = tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : 'profile'

  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync state if URL changes
  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  function handleTabChange(id: TabId) {
    setActiveTab(id)
    router.replace(`/broker/settings?tab=${id}`, { scroll: false })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: `/broker/settings?tab=${id}`, search: `?tab=${id}`, pathname: '/broker/settings' },
        })
      )
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  function triggerSaveToast() {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Settings &amp; Configuration
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Active Account
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your broker profile, subscriptions, carrier relationships, commission splits, and lead engine.
          </p>
        </div>
      </div>

      {/* Modern Tabs Bar */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'profile' && <MyProfileTab onSave={triggerSaveToast} onCopy={handleCopy} copiedKey={copiedKey} />}
        {activeTab === 'account' && <AccountTab onSave={triggerSaveToast} />}
        {activeTab === 'membership' && <MembershipTab onSave={triggerSaveToast} />}
        {activeTab === 'commissions' && <CommissionSettingsTab onSave={triggerSaveToast} />}
        {activeTab === 'consent' && <MarketingConsentTab onSave={triggerSaveToast} onCopy={handleCopy} copiedKey={copiedKey} />}
        {activeTab === 'qr-leads' && <QrLeadSettingsTab onSave={triggerSaveToast} onCopy={handleCopy} copiedKey={copiedKey} />}
      </div>
    </div>
  )
}

/* =========================================================================
   1. TAB: MY PROFILE
   ========================================================================= */
function MyProfileTab({
  onSave,
  onCopy,
  copiedKey,
}: {
  onSave: () => void
  onCopy: (t: string, k: string) => void
  copiedKey: string | null
}) {
  const [profile, setProfile] = useState({
    name: 'Jordan Davis',
    businessName: 'Apex Horizon Brokerage LLC',
    phone: '+1 (555) 234-5678',
    email: 'jordan.davis@apexhorizon.com',
    street: '100 Wall Street, Suite 1400',
    city: 'New York',
    state: 'NY',
    zip: '10005',
    brokerCode: 'BRK-NY-90214',
    npn: '18920491',
    stateLicense: 'LIC-NY-84920',
    ein: 'XX-XXX4910',
    surplusLicense: 'SL-NY-99120',
  })

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-2xl font-extrabold text-white shadow-md">
            JD
            <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">{profile.name}</h2>

            </div>
            <p className="mt-1 text-sm sm:text-base font-semibold text-slate-700">{profile.businessName}</p>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">BrokerStep ID: <span className="font-mono font-medium text-slate-700">{profile.brokerCode}</span> · Licensed in NY, NJ, CT</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopy(profile.brokerCode, 'bcode')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-[#0170FE]/40 hover:text-[#0170FE]"
            >
              {copiedKey === 'bcode' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              <span>{copiedKey === 'bcode' ? 'Copied Code' : 'Copy Broker Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6">
        {/* Personal & Business Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="size-5 text-[#0170FE]" />
            Personal &amp; Business Information
          </h3>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Business Name</label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Street Address</label>
            <input
              type="text"
              value={profile.street}
              onChange={(e) => setProfile({ ...profile, street: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">State</label>
              <input
                type="text"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Zip</label>
              <input
                type="text"
                value={profile.zip}
                onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

/* =========================================================================
   2. TAB: ACCOUNT & SECURITY
   ========================================================================= */
function AccountTab({ onSave }: { onSave: () => void }) {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Account Status & Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="size-5 text-[#0170FE]" />
          Account Status &amp; Security Controls
        </h3>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Account Status:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Active · Verified Principal
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Primary Email:</span>
            <span className="font-semibold text-slate-800">jordan.davis@apexhorizon.com</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Member Since:</span>
            <span className="font-semibold text-slate-800">January 12, 2025</span>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="size-5 text-[#0170FE]" />
          Password &amp; Reset Access
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Current Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••••••"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              placeholder="Min. 8 characters"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Repeat new password"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              <span>{showPass ? 'Hide' : 'Show'} passwords</span>
            </button>

            <Link href="/forgot-password" className="text-xs sm:text-sm font-semibold text-[#0170FE] hover:underline">
              Send reset email instead?
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">Password last changed: 42 days ago</p>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#0060db]"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   3. TAB: MEMBERSHIP / SUBSCRIPTION
   ========================================================================= */
function MembershipTab({ onSave }: { onSave: () => void }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const invoices = [
    { date: 'Oct 01, 2026', id: 'INV-2026-1001', plan: 'Professional Plan', amount: '$79.00', status: 'Paid' },
    { date: 'Sep 01, 2026', id: 'INV-2026-0901', plan: 'Professional Plan', amount: '$79.00', status: 'Paid' },
    { date: 'Aug 01, 2026', id: 'INV-2026-0801', plan: 'Professional Plan', amount: '$79.00', status: 'Paid' },
    { date: 'Jul 01, 2026', id: 'INV-2026-0701', plan: 'Starter Plan', amount: '$29.00', status: 'Paid' },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan Overview Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#0170FE]">
                CURRENT MEMBERSHIP
              </span>
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Active Subscription
              </span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Professional Workspace</h2>
            <p className="mt-1.5 text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-2xl">
              Unlimited client records, automated statement reconciliation, multi-carrier splits, and QR lead capture.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono">
                {billingCycle === 'monthly' ? '$79' : '$790'}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {billingCycle === 'monthly' ? '/ month' : '/ year'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Next renewal: November 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Plan Details & Billing Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Billing Method & Renewal Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="size-5 text-[#0170FE]" />
            Payment Method &amp; Billing Cycle
          </h3>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs tracking-wider">
                VISA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Visa ending in 4242</p>
                <p className="text-xs text-slate-500 mt-0.5">Expires 08/2028 · Default method</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSave}
              className="cursor-pointer text-xs sm:text-sm font-semibold text-[#0170FE] hover:underline"
            >
              Update Card
            </button>
          </div>

          {/* Billing Cycle Switcher */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Billing Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition ${billingCycle === 'monthly'
                  ? 'border-[#0170FE] bg-blue-50/50 ring-1 ring-[#0170FE]'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <p className="text-sm font-bold text-slate-900">Monthly Billing</p>
                <p className="text-xs text-slate-500 mt-0.5">$79 / month</p>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition relative ${billingCycle === 'yearly'
                  ? 'border-[#0170FE] bg-blue-50/50 ring-1 ring-[#0170FE]'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                  Save 17%
                </span>
                <p className="text-sm font-bold text-slate-900">Annual Billing</p>
                <p className="text-xs text-slate-500 mt-0.5">$790 / year ($65.80/mo)</p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onSave}
              className="text-xs sm:text-sm font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Cancel Subscription
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:border-[#0170FE] hover:text-[#0170FE]"
            >
              Change Tier / Enterprise
            </button>
          </div>
        </div>

        {/* Subscription History / Invoices */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="size-5 text-[#0170FE]" />
            Subscription &amp; Invoicing History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">{inv.date}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{inv.id}</td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-slate-900">{inv.amount}</span>
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200 font-semibold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={onSave}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   4. TAB: COMMISSION SETTINGS
   ========================================================================= */
interface SplitRule {
  carrier: string
  policyPrefix?: string
  defaultComm: number
  brokerSplit: number
  houseSplit: number
  renewalRate: number
}

export interface LobRule {
  id: string
  lob: string
  baseComm: number
  brokerSplit: number
  houseSplit: number
  transType: string
  note: string
}

const DEFAULT_LOB_RULES: LobRule[] = [
  {
    id: 'lob-1',
    lob: 'Commercial Property',
    baseComm: 15.0,
    brokerSplit: 80,
    houseSplit: 20,
    transType: 'All Transactions',
    note: 'Standard commercial schedule',
  },
  {
    id: 'lob-2',
    lob: 'General Liability',
    baseComm: 14.0,
    brokerSplit: 80,
    houseSplit: 20,
    transType: 'All Transactions',
    note: 'Standard CGL transactions',
  },
  {
    id: 'lob-3',
    lob: 'Commercial Auto',
    baseComm: 13.5,
    brokerSplit: 80,
    houseSplit: 20,
    transType: 'All Transactions',
    note: 'Fleet & commercial vehicle',
  },
  {
    id: 'lob-4',
    lob: 'Workers Compensation',
    baseComm: 10.0,
    brokerSplit: 80,
    houseSplit: 20,
    transType: 'All Transactions',
    note: 'State mandated rating schedule',
  },
  {
    id: 'lob-5',
    lob: 'Cyber & Technology E&O',
    baseComm: 17.5,
    brokerSplit: 85,
    houseSplit: 15,
    transType: 'New Business & Renewals',
    note: 'Specialty surplus lines bonus',
  },
]

const DEFAULT_CARRIER_SPLITS: SplitRule[] = [
  { carrier: 'Intact Insurance', policyPrefix: 'INT', defaultComm: 15.5, brokerSplit: 82, houseSplit: 18, renewalRate: 13.5 },
  { carrier: 'Travelers Insurance', policyPrefix: 'TRV', defaultComm: 15.0, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
  { carrier: 'The Hartford', policyPrefix: 'HTF', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
  { carrier: 'Liberty Mutual', policyPrefix: 'LBM', defaultComm: 15.0, brokerSplit: 85, houseSplit: 15, renewalRate: 13.0 },
  { carrier: 'Progressive Commercial', policyPrefix: 'PRG', defaultComm: 12.5, brokerSplit: 75, houseSplit: 25, renewalRate: 10.0 },
  { carrier: 'Chubb Commercial', policyPrefix: 'CHB', defaultComm: 16.0, brokerSplit: 85, houseSplit: 15, renewalRate: 14.0 },
  { carrier: 'Nationwide Mutual', policyPrefix: 'NWM', defaultComm: 14.0, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
  { carrier: 'Aviva Canada', policyPrefix: 'AVV', defaultComm: 14.0, brokerSplit: 80, houseSplit: 20, renewalRate: 12.5 },
  { carrier: 'Wawanesa Mutual Insurance', policyPrefix: 'WAW', defaultComm: 13.5, brokerSplit: 78, houseSplit: 22, renewalRate: 11.5 },
  { carrier: 'Economical / Definity Insurance', policyPrefix: 'DEF', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
]

function CommissionSettingsTab({ onSave }: { onSave: () => void }) {
  const [splits, setSplits] = useState<SplitRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('broker_settings_carriers')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (e) {
        console.error(e)
      }
    }
    return DEFAULT_CARRIER_SPLITS
  })

  // Persist to localStorage whenever carrier splits change so Add Client form stays in sync
  useEffect(() => {
    try {
      localStorage.setItem('broker_settings_carriers', JSON.stringify(splits))
    } catch (e) {
      console.error(e)
    }
  }, [splits])

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<SplitRule>({
    carrier: '',
    policyPrefix: '',
    defaultComm: 15.0,
    brokerSplit: 80,
    houseSplit: 20,
    renewalRate: 12.0,
  })

  function handleOpenAdd() {
    setModalMode('add')
    setEditingIndex(null)
    setFormData({
      carrier: '',
      policyPrefix: '',
      defaultComm: 15.0,
      brokerSplit: 80,
      houseSplit: 20,
      renewalRate: 12.0,
    })
  }

  function handleOpenEdit(index: number) {
    setModalMode('edit')
    setEditingIndex(index)
    setFormData({
      ...splits[index],
      policyPrefix: splits[index].policyPrefix || '',
    })
  }

  function handleCloseModal() {
    setModalMode(null)
    setEditingIndex(null)
  }

  function handleBrokerSplitChange(val: number) {
    const broker = isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
    setFormData((prev) => ({
      ...prev,
      brokerSplit: broker,
      houseSplit: Math.max(0, 100 - broker),
    }))
  }

  function handleHouseSplitChange(val: number) {
    const house = isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
    setFormData((prev) => ({
      ...prev,
      houseSplit: house,
      brokerSplit: Math.max(0, 100 - house),
    }))
  }

  function handleSaveRule(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.carrier.trim()) return

    const sanitizedPrefix = (formData.policyPrefix || '').trim().toUpperCase().slice(0, 3)

    if (modalMode === 'edit' && editingIndex !== null) {
      setSplits((prev) => {
        const next = [...prev]
        next[editingIndex] = {
          ...formData,
          carrier: formData.carrier.trim(),
          policyPrefix: sanitizedPrefix,
        }
        return next
      })
    } else {
      setSplits((prev) => [
        {
          ...formData,
          carrier: formData.carrier.trim(),
          policyPrefix: sanitizedPrefix,
        },
        ...prev,
      ])
    }

    handleCloseModal()
    onSave()
  }

  function handleDeleteRule() {
    if (editingIndex !== null) {
      setSplits((prev) => prev.filter((_, i) => i !== editingIndex))
      handleCloseModal()
      onSave()
    }
  }

  // Dynamic Line of Business & Transaction-Specific Rules State
  const [lobRules, setLobRules] = useState<LobRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('broker_settings_lob_rules')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (e) {
        console.error(e)
      }
    }
    return DEFAULT_LOB_RULES
  })

  // Persist to localStorage whenever LOB rules change
  useEffect(() => {
    try {
      localStorage.setItem('broker_settings_lob_rules', JSON.stringify(lobRules))
    } catch (e) {
      console.error(e)
    }
  }, [lobRules])

  // LOB modal state
  const [lobModalMode, setLobModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingLobIndex, setEditingLobIndex] = useState<number | null>(null)
  const [lobFormData, setLobFormData] = useState<LobRule>({
    id: '',
    lob: '',
    baseComm: 15.0,
    brokerSplit: 80,
    houseSplit: 20,
    transType: 'All Transactions',
    note: '',
  })

  function handleOpenAddLob() {
    setLobModalMode('add')
    setEditingLobIndex(null)
    setLobFormData({
      id: `lob-${Date.now()}`,
      lob: '',
      baseComm: 15.0,
      brokerSplit: 80,
      houseSplit: 20,
      transType: 'All Transactions',
      note: '',
    })
  }

  function handleOpenEditLob(index: number) {
    setLobModalMode('edit')
    setEditingLobIndex(index)
    setLobFormData({
      ...lobRules[index],
    })
  }

  function handleCloseLobModal() {
    setLobModalMode(null)
    setEditingLobIndex(null)
  }

  function handleLobBrokerSplitChange(val: number) {
    const broker = isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
    setLobFormData((prev) => ({
      ...prev,
      brokerSplit: broker,
      houseSplit: Math.max(0, 100 - broker),
    }))
  }

  function handleLobHouseSplitChange(val: number) {
    const house = isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
    setLobFormData((prev) => ({
      ...prev,
      houseSplit: house,
      brokerSplit: Math.max(0, 100 - house),
    }))
  }

  function handleSaveLobRule(e: React.FormEvent) {
    e.preventDefault()
    if (!lobFormData.lob.trim()) return

    if (lobModalMode === 'edit' && editingLobIndex !== null) {
      setLobRules((prev) => {
        const next = [...prev]
        next[editingLobIndex] = {
          ...lobFormData,
          lob: lobFormData.lob.trim(),
        }
        return next
      })
    } else {
      setLobRules((prev) => [
        {
          ...lobFormData,
          id: `lob-${Date.now()}`,
          lob: lobFormData.lob.trim(),
        },
        ...prev,
      ])
    }

    handleCloseLobModal()
    onSave()
  }

  function handleDeleteLobRule() {
    if (editingLobIndex !== null) {
      setLobRules((prev) => prev.filter((_, i) => i !== editingLobIndex))
      handleCloseLobModal()
      onSave()
    }
  }

  function handleDeleteLobRuleByIndex(index: number) {
    setLobRules((prev) => prev.filter((_, i) => i !== index))
    onSave()
  }

  function handleResetLobDefaults() {
    setLobRules(DEFAULT_LOB_RULES)
    onSave()
  }

  const [defaultPolicyPending, setDefaultPolicyPending] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('broker_setting_default_policy_pending')
        if (stored !== null) return stored === 'true'
      } catch (e) {
        console.error(e)
      }
    }
    return true // Default is always ON (Pending marked) per client request
  })

  return (
    <div className="space-y-6">
      {/* Client Intake & Policy Workflow Defaults */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <FileCheck2 className="size-5 text-[#0170FE]" />
              Client Intake &amp; Policy Workflow Defaults
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize default behavior when adding new clients and binding policies in your brokerage.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            Intake Workflow
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <label htmlFor="default-policy-pending-toggle" className="text-sm font-bold text-slate-900 cursor-pointer">
                Always mark Policy Number as &quot;Pending&quot; by default
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                POL-PENDING
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When enabled, opening the Add Client form will automatically pre-select <strong className="text-slate-700 font-semibold">Pending</strong> for the policy number. Brokers can uncheck it whenever they have a policy number ready to type. When disabled, the policy number input starts blank and editable.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="default-policy-pending-toggle"
              type="button"
              role="switch"
              aria-checked={defaultPolicyPending}
              onClick={() => {
                const nextVal = !defaultPolicyPending
                setDefaultPolicyPending(nextVal)
                try {
                  localStorage.setItem('broker_setting_default_policy_pending', String(nextVal))
                } catch (e) {
                  console.error(e)
                }
                onSave()
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0170FE] focus:ring-offset-2 ${defaultPolicyPending ? 'bg-[#0170FE]' : 'bg-slate-300'
                }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${defaultPolicyPending ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700 min-w-[70px]">
              {defaultPolicyPending ? 'Always On' : 'Unmarked'}
            </span>
          </div>
        </div>
      </div>
      {/* Commission Splits by Carrier */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Percent className="size-5 text-[#0170FE]" />
              Carrier Commission &amp; Split Rates
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set default contract commission percentages and broker/brokerage split shares for each active carrier.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] w-full sm:w-auto"
          >
            <Plus className="size-4" />
            <span>Add Override</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pr-6 whitespace-nowrap">Carrier Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Policy Prefix</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Default Commission %</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Broker Share %</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Brokerage (House) %</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Renewal Commission %</th>
                <th className="py-3.5 pl-4 pr-6 text-right min-w-[120px] md:sticky md:right-0 md:z-20 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] select-none whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {splits.map((row, idx) => (
                <tr key={`${row.carrier}-${idx}`} className="group hover:bg-slate-50/50">
                  <td className="py-3.5 pr-6 font-semibold text-slate-900 whitespace-nowrap">{row.carrier}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.policyPrefix ? (
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                        {row.policyPrefix}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-[#0170FE]">
                      {row.defaultComm}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{row.brokerSplit}%</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">{row.houseSplit}%</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">{row.renewalRate}%</td>
                  <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[120px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(idx)}
                      className="cursor-pointer text-xs sm:text-sm font-semibold text-[#0170FE] hover:underline"
                    >
                      Edit Rule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Override Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#0170FE]/10 text-[#0170FE]">
                  <Percent className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {modalMode === 'add' ? 'Add Commission Override' : 'Edit Commission Rule'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalMode === 'add'
                      ? 'Set custom commission contract percentages for a carrier'
                      : `Update commission and split structure for ${formData.carrier}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Carrier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                    placeholder="e.g. Hanover Insurance / AIG"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Policy No Prefix <span className="text-gray-400">(optional)</span><span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                      max 3 words
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.policyPrefix || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policyPrefix: e.target.value.toUpperCase().slice(0, 3),
                      })
                    }
                    placeholder="e.g. POL"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Commission (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.defaultComm}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultComm: parseFloat(e.target.value) || 0 })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Renewal Commission (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.renewalRate}
                      onChange={(e) =>
                        setFormData({ ...formData, renewalRate: parseFloat(e.target.value) || 0 })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Split Allocation */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Split Allocation (Total 100%)
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {formData.brokerSplit}% / {formData.houseSplit}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Broker Share (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.brokerSplit}
                      onChange={(e) => handleBrokerSplitChange(parseInt(e.target.value) || 0)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Brokerage (House) %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.houseSplit}
                      onChange={(e) => handleHouseSplitChange(parseInt(e.target.value) || 0)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                    />
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="space-y-1">
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      style={{ width: `${formData.brokerSplit}%` }}
                      className="bg-[#0170FE] transition-all duration-200"
                      title={`Broker: ${formData.brokerSplit}%`}
                    />
                    <div
                      style={{ width: `${formData.houseSplit}%` }}
                      className="bg-slate-400 transition-all duration-200"
                      title={`House: ${formData.houseSplit}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-[#0170FE]" />
                      Broker: {formData.brokerSplit}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-slate-400" />
                      House: {formData.houseSplit}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDeleteRule}
                    className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition w-full sm:w-auto"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Rule</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 sm:flex-none cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0170FE] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] whitespace-nowrap"
                  >
                    <Check className="size-4" />
                    <span>{modalMode === 'add' ? 'Save Override' : 'Update Rule'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit LOB & Transaction Rule Modal */}
      {lobModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#0170FE]/10 text-[#0170FE]">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {lobModalMode === 'add' ? 'Add Line of Business Rule' : 'Edit Line of Business Rule'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lobModalMode === 'add'
                      ? 'Configure commission rates and broker splits for a line of business'
                      : `Update commission schedule for ${lobFormData.lob}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseLobModal}
                className="cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLobRule} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Line of Business / Coverage Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lobFormData.lob}
                  onChange={(e) => setLobFormData({ ...lobFormData, lob: e.target.value })}
                  placeholder="e.g. Commercial Property, Cyber & Tech E&O..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
                {/* Quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    'Commercial Property',
                    'General Liability',
                    'Commercial Auto',
                    'Workers Compensation',
                    'Cyber & Tech E&O',
                    'Inland Marine',
                    'Umbrella / Excess',
                    'Professional Liability',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setLobFormData({ ...lobFormData, lob: sug })}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Applicable Transaction Type
                </label>
                <select
                  value={lobFormData.transType || 'All Transactions'}
                  onChange={(e) => setLobFormData({ ...lobFormData, transType: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                >
                  <option value="All Transactions">All Transactions (New, Renewal, Endorsements)</option>
                  <option value="New Business Only">New Business Only</option>
                  <option value="Renewal Only">Renewal Only</option>
                  <option value="New Business & Renewals">New Business & Renewals</option>
                  <option value="Endorsement / Mid-term Adjustment">Endorsement / Mid-term Adjustment</option>
                  <option value="Audit & Year-End True-Up">Audit & Year-End True-Up</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Base Commission Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={lobFormData.baseComm}
                      onChange={(e) =>
                        setLobFormData({ ...lobFormData, baseComm: parseFloat(e.target.value) || 0 })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Split Ratio (Broker / House)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={lobFormData.brokerSplit}
                        onChange={(e) => handleLobBrokerSplitChange(parseFloat(e.target.value))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-2.5 pr-7 text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#0170FE]"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                        % Brk
                      </span>
                    </div>
                    <span className="text-slate-400 font-bold">/</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={lobFormData.houseSplit}
                        onChange={(e) => handleLobHouseSplitChange(parseFloat(e.target.value))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-2.5 pr-7 text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#0170FE]"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                        % Hse
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Schedule Notes &amp; Guidelines
                </label>
                <textarea
                  rows={2}
                  value={lobFormData.note}
                  onChange={(e) => setLobFormData({ ...lobFormData, note: e.target.value })}
                  placeholder="e.g. Standard rating schedule, applies to direct bill statements..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {lobModalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDeleteLobRule}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Rule</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseLobModal}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
                  >
                    <Check className="size-4" />
                    <span>{lobModalMode === 'add' ? 'Add Rule' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy / Transaction-Specific Commission Information (DYNAMIC) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Sliders className="size-5 text-[#0170FE]" />
                Line of Business &amp; Transaction-Specific Information
              </h3>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-[#0170FE]">
                {lobRules.length} Rules Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Rules apply automatically during reconciliation when matching carrier statement records. Click any rule to edit, add new coverage lines, or adjust broker split rates dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetLobDefaults}
              title="Reset to default standard schedule"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddLob}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db]"
            >
              <Plus className="size-4" />
              <span>Add LOB Rule</span>
            </button>
          </div>
        </div>

        {lobRules.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <Sliders className="size-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Line of Business rules configured</p>
            <p className="text-xs text-slate-500 mt-1">Add custom rules or restore default schedules.</p>
            <button
              type="button"
              onClick={handleResetLobDefaults}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {lobRules.map((rule, idx) => (
              <div
                key={rule.id || `${rule.lob}-${idx}`}
                className="group rounded-xl border border-slate-200 hover:border-blue-300 bg-white p-4 space-y-3 transition shadow-xs hover:shadow-sm"
              >
                {/* Header: Title + Base Comm Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#0170FE] transition">
                      {rule.lob}
                    </span>
                    {rule.transType && (
                      <span className="block text-[11px] font-medium text-slate-500 mt-0.5">
                        {rule.transType}
                      </span>
                    )}
                  </div>
                  <span className="rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-mono font-bold text-[#0170FE] shrink-0">
                    {rule.baseComm}%
                  </span>
                </div>

                {/* Broker Split & House Share */}
                <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Broker Split Share:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {rule.brokerSplit}% <span className="text-slate-400 font-normal">/ {rule.houseSplit}% house</span>
                    </span>
                  </div>
                  {/* Visual Ratio Bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div className="bg-[#0170FE] h-full" style={{ width: `${rule.brokerSplit}%` }} />
                    <div className="bg-slate-400 h-full" style={{ width: `${rule.houseSplit}%` }} />
                  </div>
                </div>

                {/* Description Note */}
                <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                  {rule.note || 'Standard schedule applies during statement reconciliation.'}
                </p>

                {/* Action footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditLob(idx)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline cursor-pointer"
                  >
                    <Pencil className="size-3" />
                    <span>Edit Rule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLobRuleByIndex(idx)}
                    title={`Delete ${rule.lob} rule`}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   6. TAB: MARKETING CONSENT
   ========================================================================= */
function MarketingConsentTab({
  onSave,
  onCopy,
  copiedKey,
}: {
  onSave: () => void
  onCopy: (t: string, k: string) => void
  copiedKey: string | null
}) {
  const consentLink = 'https://brokerstep.app/consent/req/brk-ny-90214'

  // Customizer form settings
  const [formSettings, setFormSettings] = useState({
    agencyName: 'Apex Horizon Brokerage LLC',
    licenseNumber: 'BR-NY-882109',
    allowSms: true,
    allowEmail: true,
    allowVoice: true,
    requireSignature: true,
    autoConfirmationReceipt: true,
    disclaimerText:
      'I acknowledge that consent is voluntary and not a condition of purchasing insurance coverage. Message and data rates may apply. Reply STOP to cancel at any time.',
  })

  // Live interactive preview states
  const [clientName, setClientName] = useState('Robert Vance')
  const [clientBusiness, setClientBusiness] = useState('Apex Logistics Inc.')
  const [clientPhone, setClientPhone] = useState('(555) 234-5678')
  const [clientEmail, setClientEmail] = useState('r.vance@apexlogistics.com')
  const [smsOptIn, setSmsOptIn] = useState(true)
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [voiceOptIn, setVoiceOptIn] = useState(false)
  const [signature, setSignature] = useState('Robert Vance')
  const [acknowledged, setAcknowledged] = useState(true)
  const [previewSubmitted, setPreviewSubmitted] = useState(false)

  // Modals state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  // Handle preview form submit test
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!acknowledged) {
      alert('Please check the authorization confirmation checkbox.')
      return
    }
    setPreviewSubmitted(true)
    onSave()
    setTimeout(() => {
      setPreviewSubmitted(false)
    }, 4500)
  }

  return (
    <div className="space-y-6">
      {/* 2. Consent Form Suite: Form Customizer & Live Interactive Form */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form Builder & Disclosures Customizer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 lg:col-span-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Sliders className="size-5 text-[#0170FE]" />
                Consent Form Builder
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Customize disclosure terms, signature requirements, and communication channels.
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              Form v3.2
            </span>
          </div>

          {/* Agency & License Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Agency Name on Consent Agreement
              </label>
              <input
                type="text"
                value={formSettings.agencyName}
                onChange={(e) => setFormSettings({ ...formSettings, agencyName: e.target.value })}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#0170FE]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Broker License / NPN Number
              </label>
              <input
                type="text"
                value={formSettings.licenseNumber}
                onChange={(e) => setFormSettings({ ...formSettings, licenseNumber: e.target.value })}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#0170FE]"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Consent Channels to Request
            </p>

            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.allowSms}
                onChange={(e) => setFormSettings({ ...formSettings, allowSms: e.target.checked })}
                className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Automated SMS &amp; Text Alerts</span>
                <span className="text-slate-500">Requires explicit TCPA 10DLC disclosure with STOP reply support</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.allowEmail}
                onChange={(e) => setFormSettings({ ...formSettings, allowEmail: e.target.checked })}
                className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Electronic Policy &amp; Email Marketing</span>
                <span className="text-slate-500">Covers email proposals, rate changes, and policy delivery</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.allowVoice}
                onChange={(e) => setFormSettings({ ...formSettings, allowVoice: e.target.checked })}
                className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Direct Broker Calls &amp; Voicemails</span>
                <span className="text-slate-500">Permits agent calls regarding renewal quotes and bound policies</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.requireSignature}
                onChange={(e) => setFormSettings({ ...formSettings, requireSignature: e.target.checked })}
                className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Require E-Signature &amp; Timestamp</span>
                <span className="text-slate-500">Creates legally binding electronic signature record</span>
              </div>
            </label>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Mandatory Legal Disclaimer Text
            </label>
            <textarea
              rows={3}
              value={formSettings.disclaimerText}
              onChange={(e) => setFormSettings({ ...formSettings, disclaimerText: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 outline-none focus:border-[#0170FE]"
            />
          </div>

          <button
            type="button"
            onClick={onSave}
            className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Save className="size-4" />
            <span>Submit</span>
          </button>
        </div>

        {/* Right Column: Live Client-Facing Consent Form Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 lg:col-span-7">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-950">Live Client Consent Form Preview</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Interactive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Exact form your policyholder views and signs when opening your consent link.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setClientName('Jane M. Vance')
                setClientBusiness('Apex Logistics Inc.')
                setPreviewSubmitted(false)
              }}
              className="text-xs text-[#0170FE] font-semibold hover:underline cursor-pointer"
            >
              Reset Sample Data
            </button>
          </div>

          {/* The Actual Rendered Form Card */}
          <form
            onSubmit={handleTestSubmit}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50/30 p-5 sm:p-6 shadow-sm space-y-5"
          >
            {/* Form Agency Header */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#0170FE]" />
                    <h4 className="text-sm sm:text-base font-bold text-slate-950">{formSettings.agencyName}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Licensed Broker ID: <span className="font-mono font-medium">{formSettings.licenseNumber}</span>
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shrink-0">
                  Form 10DLC-A
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-blue-100/80">
                <strong>Authorization Agreement:</strong> Please verify your preferred contact channels to receive official policy notices,
                claim updates, and insurance quotes.
              </p>
            </div>

            {/* Step 1: Policyholder Identification */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                1. Policyholder / Business Contact Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-[#0170FE]"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Business / Company Name</label>
                  <input
                    type="text"
                    value={clientBusiness}
                    onChange={(e) => setClientBusiness(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-[#0170FE]"
                    placeholder="e.g. Acme Corp LLC"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Mobile Phone (for SMS)</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-[#0170FE]"
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-[#0170FE]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Communication Channel Consent Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                2. Communication Permissions &amp; Authorizations
              </span>

              {formSettings.allowSms && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0170FE]/50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Authorize Automated SMS Policy &amp; Renewal Notifications
                    </span>
                    <span className="text-slate-600 mt-0.5 block leading-relaxed">
                      I agree to receive automated policy renewal alerts, payment reminders, and quote status messages via SMS from{' '}
                      {formSettings.agencyName}. Msg &amp; data rates may apply. Reply STOP to cancel anytime.
                    </span>
                  </div>
                </label>
              )}

              {formSettings.allowEmail && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0170FE]/50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOptIn}
                    onChange={(e) => setEmailOptIn(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Electronic Delivery &amp; Marketing Disclosures
                    </span>
                    <span className="text-slate-600 mt-0.5 block leading-relaxed">
                      I consent to receive electronic policy binders, insurance rate revisions, coverage advisory summaries, and promotional
                      quotes at my provided email.
                    </span>
                  </div>
                </label>
              )}

              {formSettings.allowVoice && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0170FE]/50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceOptIn}
                    onChange={(e) => setVoiceOptIn(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Direct Voice Follow-ups &amp; Claims Consultation
                    </span>
                    <span className="text-slate-600 mt-0.5 block leading-relaxed">
                      I authorize agency brokers and account managers to contact me by phone regarding open claims or policy binding questions.
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Step 3: Legal Disclaimer Notice Box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="size-3.5 text-amber-700" />
                <span>TCPA &amp; Regulatory Disclosure Notice</span>
              </div>
              <p>{formSettings.disclaimerText}</p>
            </div>

            {/* Step 4: Electronic Signature Canvas / Field */}
            {formSettings.requireSignature && (
              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  3. Digital Electronic Signature
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Type Full Name as E-Signature</label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      required
                      placeholder="Jane M. Vance"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-serif italic text-base font-bold text-slate-900 outline-none focus:border-[#0170FE]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Timestamp / Date</label>
                    <div className="h-10 rounded-lg border border-slate-200 bg-slate-100/70 px-3 flex items-center font-mono text-xs text-slate-600">
                      <Clock className="size-3.5 mr-1.5 text-slate-400" />
                      Oct 12, 2026 · 17:30 UTC (Auto-Logged)
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-[#0170FE] focus:ring-[#0170FE]"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    I declare that I am the authorized contact or officer for the named business and agree that this digital signature has
                    the same legal validity as a handwritten signature under the ESIGN Act.
                  </span>
                </label>
              </div>
            )}

            {/* Success state feedback on submit test */}
            {previewSubmitted && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Digital Consent Successfully Verified &amp; Logged!</p>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">
                    Audit Verification Hash: SHA256:7f3b8901ac9941a · IP: 127.0.0.1
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0170FE] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#0170FE]/20 hover:bg-[#0060db] transition"
              >
                <Fingerprint className="size-4" />
                <span>Authorize &amp; Submit Digital Consent</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                256-Bit SSL Encrypted Verification · Immediate TCPA 10DLC Registry Logging
              </p>
            </div>
          </form>
        </div>
      </div>




      {/* 5. MODAL: Full Public Client View Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-blue-50 text-[#0170FE] flex items-center justify-center">
                  <Eye className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Public Client Consent Portal Preview</h3>
                  <p className="text-xs text-slate-500">How your clients view this form on their browser</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium cursor-pointer ${previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                  >
                    <Laptop className="size-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium cursor-pointer ${previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                  >
                    <Smartphone className="size-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-slate-100/50 flex justify-center">
              <div className={`w-full ${previewDevice === 'mobile' ? 'max-w-sm border-4 border-slate-800 rounded-3xl p-3 bg-white shadow-xl' : 'max-w-2xl bg-white rounded-2xl p-6 shadow-sm border border-slate-200'}`}>
                <div className="text-center pb-4 border-b border-slate-100">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0170FE] border border-blue-200 mb-2">
                    Official Agency Consent Portal
                  </span>
                  <h4 className="text-lg font-bold text-slate-950">{formSettings.agencyName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Insurance License: {formSettings.licenseNumber}</p>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-700 leading-relaxed">
                    Under the Federal Telephone Consumer Protection Act (TCPA) and GLBA Privacy rules, {formSettings.agencyName} requires
                    your authorization to communicate via electronic text messages and digital proposals.
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-900 block">Your Contact Details</label>
                    <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-slate-800 font-medium">
                      {clientName} · {clientBusiness}
                    </div>
                    <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-slate-800 font-mono text-xs">
                      {clientPhone} · {clientEmail}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="font-bold text-slate-900 block">Authorized Communication Channels</label>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-600" />
                        <span>Automated Renewal Reminders &amp; Policy Expiration Alerts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-600" />
                        <span>Electronic Insurance Disclosures &amp; Bound Quotes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-600" />
                        <span>Direct Broker Voice Calls &amp; Claim Consultation</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-900 text-[11px] leading-relaxed">
                    {formSettings.disclaimerText}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-[#0170FE] py-2.5 text-center font-bold text-white shadow-xs pointer-events-none"
                    >
                      Authorize &amp; Sign Consent
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>Public intake link: <span className="font-mono">{consentLink}</span></span>
              <button
                type="button"
                onClick={() => onCopy(consentLink, 'previewModal')}
                className="cursor-pointer font-bold text-[#0170FE] hover:underline"
              >
                {copiedKey === 'previewModal' ? 'Copied Link!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

/* =========================================================================
   7. TAB: QR / LEAD SETTINGS
   ========================================================================= */
function QrLeadSettingsTab({
  onSave,
  onCopy,
  copiedKey,
}: {
  onSave: () => void
  onCopy: (t: string, k: string) => void
  copiedKey: string | null
}) {
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')
  const brokerCode = 'BRK-NY-90214'
  const brokerName = 'Jordan Davis'
  const businessName = 'Apex Horizon Brokerage LLC'
  const leadUrl = `https://brokerstep.app/lead/${brokerCode}`
  const iframeSnippet = `<iframe src="${leadUrl}" width="100%" height="750" frameborder="0" style="border:0;border-radius:16px;"></iframe>`

  function handleDownloadSvg() {
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="600" height="600">
      <rect width="200" height="200" fill="#ffffff" rx="16"/>
      <rect x="18" y="18" width="48" height="48" rx="6" fill="none" stroke="#0f172a" stroke-width="8"/>
      <rect x="32" y="32" width="20" height="20" rx="4" fill="#0170FE"/>
      <rect x="134" y="18" width="48" height="48" rx="6" fill="none" stroke="#0f172a" stroke-width="8"/>
      <rect x="148" y="32" width="20" height="20" rx="4" fill="#0170FE"/>
      <rect x="18" y="134" width="48" height="48" rx="6" fill="none" stroke="#0f172a" stroke-width="8"/>
      <rect x="32" y="148" width="20" height="20" rx="4" fill="#0170FE"/>
      <rect x="80" y="20" width="12" height="12" fill="#0f172a" rx="2"/>
      <rect x="104" y="20" width="16" height="12" fill="#0170FE" rx="2"/>
      <rect x="76" y="44" width="44" height="12" fill="#0f172a" rx="2"/>
      <rect x="20" y="80" width="44" height="14" fill="#0f172a" rx="2"/>
      <rect x="36" y="104" width="28" height="14" fill="#0170FE" rx="2"/>
      <rect x="74" y="74" width="52" height="52" rx="10" fill="#0170FE"/>
      <text x="100" y="104" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">BS</text>
      <rect x="138" y="80" width="14" height="38" fill="#0f172a" rx="2"/>
      <rect x="162" y="90" width="20" height="16" fill="#0170FE" rx="2"/>
      <rect x="78" y="136" width="20" height="16" fill="#0f172a" rx="2"/>
      <rect x="108" y="136" width="30" height="20" fill="#0170FE" rx="2"/>
      <rect x="148" y="146" width="34" height="36" fill="#0f172a" rx="2"/>
      <rect x="78" y="166" width="56" height="16" fill="#0170FE" rx="2"/>
    </svg>`
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brokerstep-qr-${brokerCode}.svg`
    a.click()
    URL.revokeObjectURL(url)
    onSave()
  }

  function handleDownloadPng() {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 600, 600)

    const drawRect = (x: number, y: number, w: number, h: number, fill: string) => {
      ctx.fillStyle = fill
      ctx.fillRect(x * 3, y * 3, w * 3, h * 3)
    }

    // Corner Finder 1
    drawRect(18, 18, 48, 48, '#0f172a')
    drawRect(26, 26, 32, 32, '#ffffff')
    drawRect(32, 32, 20, 20, '#0170FE')

    // Corner Finder 2
    drawRect(134, 18, 48, 48, '#0f172a')
    drawRect(142, 26, 32, 32, '#ffffff')
    drawRect(148, 32, 20, 20, '#0170FE')

    // Corner Finder 3
    drawRect(18, 134, 48, 48, '#0f172a')
    drawRect(26, 142, 32, 32, '#ffffff')
    drawRect(32, 148, 20, 20, '#0170FE')

    // Central & side patterns
    drawRect(80, 20, 12, 12, '#0f172a')
    drawRect(104, 20, 16, 12, '#0170FE')
    drawRect(76, 44, 44, 12, '#0f172a')
    drawRect(20, 80, 44, 14, '#0f172a')
    drawRect(36, 104, 28, 14, '#0170FE')
    drawRect(74, 74, 52, 52, '#0170FE')
    drawRect(138, 80, 14, 38, '#0f172a')
    drawRect(162, 90, 20, 16, '#0170FE')
    drawRect(78, 136, 20, 16, '#0f172a')
    drawRect(108, 136, 30, 20, '#0170FE')
    drawRect(148, 146, 34, 36, '#0f172a')
    drawRect(78, 166, 56, 16, '#0170FE')

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BS', 300, 300)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `brokerstep-qr-${brokerCode}.png`
    a.click()
    onSave()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Broker QR Code Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-5 lg:col-span-5">
        <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <QrCode className="size-5 text-[#0170FE]" />
              Broker Dynamic QR Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Unique QR code permanently associated with your Broker account.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 whitespace-nowrap">
            Active Pro
          </span>
        </div>

        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="rounded-2xl border-4 border-[#0170FE] bg-white p-4 shadow-md transition hover:shadow-lg">
            {/* Ultra-Crisp Scalable Vector QR Code */}
            <svg
              className="size-48"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="200" height="200" fill="white" rx="12" />
              {/* Corner 1 (Top Left) */}
              <rect x="18" y="18" width="48" height="48" rx="6" stroke="#0f172a" strokeWidth="8" />
              <rect x="32" y="32" width="20" height="20" rx="4" fill="#0170FE" />

              {/* Corner 2 (Top Right) */}
              <rect x="134" y="18" width="48" height="48" rx="6" stroke="#0f172a" strokeWidth="8" />
              <rect x="148" y="32" width="20" height="20" rx="4" fill="#0170FE" />

              {/* Corner 3 (Bottom Left) */}
              <rect x="18" y="134" width="48" height="48" rx="6" stroke="#0f172a" strokeWidth="8" />
              <rect x="32" y="148" width="20" height="20" rx="4" fill="#0170FE" />

              {/* Data matrix dots */}
              <rect x="80" y="20" width="12" height="12" fill="#0f172a" rx="2" />
              <rect x="104" y="20" width="16" height="12" fill="#0170FE" rx="2" />
              <rect x="76" y="44" width="44" height="12" fill="#0f172a" rx="2" />

              <rect x="20" y="80" width="44" height="14" fill="#0f172a" rx="2" />
              <rect x="36" y="104" width="28" height="14" fill="#0170FE" rx="2" />

              {/* Center BrokerStep branding pill */}
              <rect x="74" y="74" width="52" height="52" rx="10" fill="#0170FE" />
              <text x="100" y="104" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle">BS</text>

              {/* Bottom right data blocks */}
              <rect x="138" y="80" width="14" height="38" fill="#0f172a" rx="2" />
              <rect x="162" y="90" width="20" height="16" fill="#0170FE" rx="2" />
              <rect x="78" y="136" width="20" height="16" fill="#0f172a" rx="2" />
              <rect x="108" y="136" width="30" height="20" fill="#0170FE" rx="2" />
              <rect x="148" y="146" width="34" height="36" fill="#0f172a" rx="2" />
              <rect x="78" y="166" width="56" height="16" fill="#0170FE" rx="2" />
            </svg>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-sm font-bold text-slate-900">{businessName}</p>
            <p className="text-xs text-slate-500">
              Assigned Broker: <span className="font-semibold text-slate-700">{brokerName}</span>
            </p>
            <span className="inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-800">
              Account ID: {brokerCode}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-800 shadow-xs hover:border-[#0170FE] hover:text-[#0170FE] transition"
            >
              <Download className="size-3.5" />
              <span>PNG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-800 shadow-xs hover:border-[#0170FE] hover:text-[#0170FE] transition"
            >
              <Download className="size-3.5" />
              <span>SVG</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator
                    .share({
                      title: `${brokerName} - Insurance Intake Form`,
                      text: `Submit your insurance quote request directly to ${brokerName} (${businessName}):`,
                      url: leadUrl,
                    })
                    .catch(() => {
                      onCopy(leadUrl, 'qrshare')
                    })
                } else {
                  onCopy(leadUrl, 'qrshare')
                }
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-800 shadow-xs hover:border-[#0170FE] hover:text-[#0170FE] transition"
            >
              {copiedKey === 'qrshare' ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Requirement 10.1 Compliance Safeguards Notice */}
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
            <ShieldCheck className="size-4.5 text-[#0170FE]" />
            <span>Broker Attribution &amp; Privacy Safeguards</span>
          </div>
          <ul className="text-xs text-blue-900/80 space-y-1.5">
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100% Attribution:</strong> Every inquiry submitted through this QR code is permanently assigned to {brokerName} ({brokerCode}).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Private Data Exposure:</strong> No private SSN, EIN, commissions, or bank records are contained in the QR payload or URL.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Instant Alert:</strong> Real-time lead notifications are delivered into your BrokerStep CRM dashboard.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right: Public Form Preview & Embed Code */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-5 lg:col-span-7">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Public Form Preview &amp; Embed</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live prospective client view when scanning your Broker-specific QR code
            </p>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${previewDevice === 'mobile'
                ? 'bg-white text-[#0170FE] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Smartphone className="size-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${previewDevice === 'desktop'
                ? 'bg-white text-[#0170FE] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Laptop className="size-3.5" />
              <span>Desktop</span>
            </button>
          </div>
        </div>

        {/* Dynamic Frame Preview Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-2.5 sm:p-6 overflow-hidden">
          <div
            className={`mx-auto bg-white transition-all duration-300 ${previewDevice === 'mobile'
              ? 'max-w-[390px] rounded-[32px] border-[5px] border-slate-900 shadow-2xl p-4 sm:p-5'
              : 'w-full rounded-2xl border border-slate-200 shadow-md p-4 sm:p-6'
              }`}
          >
            {/* Mobile Notch Bar if in Mobile Mode */}
            {previewDevice === 'mobile' && (
              <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 mb-3 text-[10px] font-semibold text-slate-500">
                <span>9:41 AM</span>
                <div className="h-3.5 w-20 rounded-full bg-slate-900 mx-auto" />
                <span>5G · 100%</span>
              </div>
            )}

            {/* Desktop Mock Browser Bar if in Desktop Mode */}
            {previewDevice === 'desktop' && (
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-xs min-w-0">
                <div className="flex gap-1.5 shrink-0">
                  <div className="size-2.5 rounded-full bg-rose-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[10.5px] sm:text-[11px] font-mono text-slate-600 truncate">
                  {leadUrl}
                </div>
              </div>
            )}

            {/* Branded Form Header (Direct Broker Association) */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-xs sm:text-sm font-bold text-white shadow-xs">
                    JD
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-950 leading-tight truncate">
                      {businessName}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      Assigned Broker: <span className="font-semibold text-slate-800">{brokerName}</span>
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-[#0170FE] border border-blue-200 shrink-0">
                  Verified Broker
                </span>
              </div>

              {/* Attribution Banner */}
              <div className="rounded-lg bg-emerald-50/80 px-2.5 sm:px-3 py-1.5 text-[10.5px] sm:text-[11px] font-medium text-emerald-800 border border-emerald-200/70 flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600 shrink-0" />
                <span className="break-words leading-tight">
                  Quote request is directly routed to <strong>{brokerName}</strong> ({brokerCode}).
                </span>
              </div>
            </div>

            {/* Form Fields: Client Lead Information */}
            <div className="mt-4 space-y-3 sm:space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-slate-600 mb-1 truncate">
                    Contact Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium text-xs truncate">
                    Jane Smith
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-slate-600 mb-1 truncate">
                    Company / Business Name
                  </label>
                  <div className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium text-xs truncate">
                    Smith Logistics LLC
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-slate-600 mb-1 truncate">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium text-xs truncate">
                    jane@smithlogistics.com
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-slate-600 mb-1 truncate">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium text-xs truncate">
                    +1 (555) 234-8890
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 mb-1 truncate">
                  Coverage Requested <span className="text-rose-500">*</span>
                </label>
                <div className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium text-xs truncate">
                  Commercial Property &amp; General Liability
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Message / Inquiries
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-700 leading-relaxed">
                  Looking to review existing warehouse coverage and request quote options.
                </div>
              </div>

              {/* Express Consent & Client Privacy Shield */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckSquare className="size-4 text-[#0170FE] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-tight">
                    I authorize <strong>{brokerName} ({businessName})</strong> to review my insurance request and contact me with competitive quotes. Client information is encrypted and never shared.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 border-t border-slate-200/80 pt-1.5 leading-snug">
                  <Lock className="size-3 text-emerald-600 shrink-0" />
                  <span className="break-words">256-bit Encrypted SSL · TCPA &amp; ESIGN Compliant · Attribution token: {brokerCode}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                className="w-full rounded-xl bg-[#0170FE] py-2.5 sm:py-3 px-3 text-center text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 pointer-events-none break-words leading-tight"
              >
                Submit Quote Request → Routes to {brokerName}
              </button>
            </div>
          </div>
        </div>

        {/* Website Embed Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Embed Code for Your Brokerage Website (HTML iFrame)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={iframeSnippet}
              className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-mono text-slate-600 outline-none truncate"
            />
            <button
              type="button"
              onClick={() => onCopy(iframeSnippet, 'iframe')}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 sm:py-0 text-xs sm:text-sm font-semibold hover:border-[#0170FE] hover:text-[#0170FE] shrink-0"
            >
              {copiedKey === 'iframe' ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4 text-slate-500" />
              )}
              <span>{copiedKey === 'iframe' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrokerSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#0170FE]" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
