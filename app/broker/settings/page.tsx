'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  ShieldCheck,
  Award,
  Building2,
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
} from 'lucide-react'

// Tabs definition
type TabId =
  | 'profile'
  | 'account'
  | 'membership'
  | 'carriers'
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
  { id: 'carriers', label: 'Carriers', icon: Building2, badge: '8 Connected' },
  { id: 'commissions', label: 'Commission Settings', icon: Sliders },
  { id: 'consent', label: 'Marketing Consent', icon: FileCheck2, badge: 'Compliant' },
  { id: 'qr-leads', label: 'QR / Lead Settings', icon: QrCode, badge: 'Active' },
]

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') as TabId | null

  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'profile')
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

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 animate-in fade-in duration-200">
              <Check className="size-3.5" />
              Settings saved!
            </div>
          )}
          <button
            type="button"
            onClick={triggerSaveToast}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db]"
          >
            <Save className="size-4" />
            <span>Save Changes</span>
          </button>
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
        {activeTab === 'carriers' && <CarriersTab onSave={triggerSaveToast} />}
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
              <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-[#0170FE] border border-[#0170FE]/20">
                Principal Broker
              </span>
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
      <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Regulatory & Broker Identifiers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#0170FE]" />
            Broker Code &amp; Agreed Identifiers
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Broker Code / Identifier</label>
              <span className="text-xs text-emerald-600 font-semibold">Verified System ID</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={profile.brokerCode}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-mono font-medium text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => onCopy(profile.brokerCode, 'bcode2')}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-semibold hover:border-[#0170FE]"
              >
                {copiedKey === 'bcode2' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">National Producer # (NPN)</label>
              <input
                type="text"
                value={profile.npn}
                onChange={(e) => setProfile({ ...profile, npn: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Resident State License</label>
              <input
                type="text"
                value={profile.stateLicense}
                onChange={(e) => setProfile({ ...profile, stateLicense: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Surplus Lines License</label>
              <input
                type="text"
                value={profile.surplusLicense}
                onChange={(e) => setProfile({ ...profile, surplusLicense: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Agency Tax ID / EIN</label>
              <input
                type="text"
                value={profile.ein}
                onChange={(e) => setProfile({ ...profile, ein: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4.5 text-[#0170FE] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Regulatory Verification Status</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your agreed identifiers are synced with NIPR and state insurance departments.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#0060db]"
            >
              Update Profile Details
            </button>
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

        {/* Two Factor Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
            <p className="text-xs text-slate-500 mt-0.5">Secure broker login using an authenticator app (TOTP)</p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactor(!twoFactor)}
            className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${twoFactor ? 'bg-[#0170FE]' : 'bg-slate-300'
              }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${twoFactor ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Active Sessions */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Active Security Sessions</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Laptop className="size-4.5 text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">Chrome on macOS · New York, USA</p>
                  <p className="text-xs text-emerald-600 font-medium">Active Now · Current Session</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">IP: 72.229.xx</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Smartphone className="size-4.5 text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-900">Safari on iPhone 15 Pro</p>
                  <p className="text-xs text-slate-400 font-medium">Last active 2 hours ago</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onSave}
                className="cursor-pointer text-xs sm:text-sm font-semibold text-rose-600 hover:underline"
              >
                Revoke
              </button>
            </div>
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
   4. TAB: CARRIERS
   ========================================================================= */
function CarriersTab({ onSave }: { onSave: () => void }) {
  const [searchTerm, setSearchTerm] = useState('')

  const [carriers, setCarriers] = useState([
    {
      id: 'TRV',
      name: 'Travelers Insurance',
      code: 'TRV-88214',
      status: 'Active',
      rep: 'Sarah Jenkins',
      phone: '+1 (800) 252-4633',
      portal: 'travelers.com/broker-portal',
      payout: 'Bi-weekly Direct Deposit',
      appointmentId: 'APT-99410',
      connected: true,
    },
    {
      id: 'HTF',
      name: 'The Hartford',
      code: 'HTF-51209',
      status: 'Active',
      rep: 'Michael Rossi',
      phone: '+1 (800) 447-7649',
      portal: 'thehartford.com/agency-ebiz',
      payout: 'Monthly Direct Deposit',
      appointmentId: 'APT-30119',
      connected: true,
    },
    {
      id: 'LBM',
      name: 'Liberty Mutual Commercial',
      code: 'LBM-99312',
      status: 'Active',
      rep: 'Jessica Wu',
      phone: '+1 (800) 362-0000',
      portal: 'libertymutual.com/agents',
      payout: 'Bi-weekly Direct Deposit',
      appointmentId: 'APT-14920',
      connected: true,
    },
    {
      id: 'PRG',
      name: 'Progressive Commercial Lines',
      code: 'PRG-44182',
      status: 'Active',
      rep: 'Daniel Kim',
      phone: '+1 (800) 876-5581',
      portal: 'foragentsonly.com',
      payout: 'Weekly Direct Deposit',
      appointmentId: 'APT-58190',
      connected: true,
    },
    {
      id: 'CHB',
      name: 'Chubb Commercial Insurance',
      code: 'CHB-30911',
      status: 'Active',
      rep: 'Elena Vance',
      phone: '+1 (800) 699-9916',
      portal: 'chubb.com/brokers',
      payout: 'Monthly Direct Deposit',
      appointmentId: 'APT-84012',
      connected: true,
    },
    {
      id: 'NW',
      name: 'Nationwide Mutual',
      code: 'NW-77218',
      status: 'Active',
      rep: 'Marcus Clark',
      phone: '+1 (800) 542-9080',
      portal: 'nationwide.com/producers',
      payout: 'Monthly ACH',
      appointmentId: 'APT-60291',
      connected: true,
    },
    {
      id: 'BHH',
      name: 'Berkshire Hathaway Homestate',
      code: 'BHH-20419',
      status: 'Pending Appointment',
      rep: 'Underwriting Review',
      phone: '+1 (800) 488-2930',
      portal: 'bhhc.com',
      payout: 'Awaiting Activation',
      appointmentId: 'SUBMITTED-OCT26',
      connected: false,
    },
  ])

  const filtered = carriers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search carriers by name or code..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#0060db]"
        >
          <Plus className="size-4" />
          <span>Add New Carrier / Appointment</span>
        </button>
      </div>

      {/* Carriers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((carrier) => (
          <div
            key={carrier.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#0170FE]/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xs">
                  {carrier.id}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${carrier.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                >
                  {carrier.status}
                </span>
              </div>

              <h4 className="mt-3.5 text-lg font-bold text-slate-950">{carrier.name}</h4>
              <p className="text-xs text-slate-500 font-mono font-medium">Code: {carrier.code}</p>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Appointment ID:</span>
                  <span className="font-semibold text-slate-800 font-mono">{carrier.appointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Representative:</span>
                  <span className="font-semibold text-slate-800">{carrier.rep}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <span className="font-semibold text-slate-800">{carrier.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Payout Schedule:</span>
                  <span className="font-semibold text-emerald-600">{carrier.payout}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://${carrier.portal}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline"
              >
                <span>Carrier Portal</span>
                <ExternalLink className="size-3.5" />
              </a>

              <button
                type="button"
                onClick={onSave}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Configure Splits
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   5. TAB: COMMISSION SETTINGS
   ========================================================================= */
function CommissionSettingsTab({ onSave }: { onSave: () => void }) {
  const [splits, setSplits] = useState([
    { carrier: 'Travelers Insurance', defaultComm: 15.0, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
    { carrier: 'The Hartford', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
    { carrier: 'Liberty Mutual', defaultComm: 15.0, brokerSplit: 85, houseSplit: 15, renewalRate: 13.0 },
    { carrier: 'Progressive Commercial', defaultComm: 12.5, brokerSplit: 75, houseSplit: 25, renewalRate: 10.0 },
    { carrier: 'Chubb Commercial', defaultComm: 16.0, brokerSplit: 85, houseSplit: 15, renewalRate: 14.0 },
    { carrier: 'Nationwide Mutual', defaultComm: 14.0, brokerSplit: 80, houseSplit: 20, renewalRate: 12.0 },
  ])

  const lobRules = [
    { lob: 'Commercial Property', baseComm: '15.0%', split: '80 / 20', note: 'Standard commercial schedule' },
    { lob: 'General Liability', baseComm: '14.0%', split: '80 / 20', note: 'Standard CGL transactions' },
    { lob: 'Commercial Auto', baseComm: '13.5%', split: '80 / 20', note: 'Fleet & commercial vehicle' },
    { lob: 'Workers Compensation', baseComm: '10.0%', split: '80 / 20', note: 'State mandated rating schedule' },
    { lob: 'Cyber & Technology E&O', baseComm: '17.5%', split: '85 / 15', note: 'Specialty surplus lines bonus' },
  ]

  return (
    <div className="space-y-6">
      {/* Commission Splits by Carrier */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
            onClick={onSave}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-[#0170FE] hover:text-[#0170FE]"
          >
            <Plus className="size-4" />
            Add Override
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3">Carrier Name</th>
                <th className="pb-3">Default Commission %</th>
                <th className="pb-3">Broker Share %</th>
                <th className="pb-3">Brokerage (House) %</th>
                <th className="pb-3">Renewal Commission %</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {splits.map((row, idx) => (
                <tr key={row.carrier} className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-900">{row.carrier}</td>
                  <td className="py-3">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-[#0170FE]">
                      {row.defaultComm}%
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900">{row.brokerSplit}%</td>
                  <td className="py-3 font-mono font-medium text-slate-500">{row.houseSplit}%</td>
                  <td className="py-3 font-mono font-semibold text-slate-700">{row.renewalRate}%</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={onSave}
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

      {/* Policy / Transaction-Specific Commission Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Sliders className="size-5 text-[#0170FE]" />
            Line of Business &amp; Transaction-Specific Information
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rules apply automatically during reconciliation when matching carrier statement records.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lobRules.map((rule) => (
            <div key={rule.lob} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{rule.lob}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                  {rule.baseComm}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                <span>Broker Split:</span>
                <span className="font-mono font-bold text-slate-800">{rule.split}</span>
              </div>
              <p className="text-xs text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">{rule.note}</p>
            </div>
          ))}
        </div>
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

  const consentRecords = [
    { client: 'Apex Logistics Inc.', contact: 'Robert Vance', channel: 'SMS + Email', date: 'Oct 08, 2026', status: 'Consented', hash: 'SHA256:8891..c4' },
    { client: 'Harbor Dental Care', contact: 'Dr. Amy Lin', channel: 'Email Verification', date: 'Oct 02, 2026', status: 'Consented', hash: 'SHA256:4910..a1' },
    { client: 'Cascade Manufacturing', contact: 'Thomas Miller', channel: 'SMS Automated', date: 'Sep 24, 2026', status: 'Withdrawn', hash: 'SHA256:1192..e9' },
    { client: 'Skyline Restaurant Group', contact: 'Mario Conti', channel: 'In-Person Digital', date: 'Sep 18, 2026', status: 'Consented', hash: 'SHA256:6630..d8' },
    { client: 'Beacon Freight LLC', contact: 'Marcus Brody', channel: 'Phone Verification', date: 'Sep 12, 2026', status: 'Declined', hash: 'SHA256:0041..f2' },
  ]

  return (
    <div className="space-y-6">
      {/* Consent Engine Status & Request Link */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <FileCheck2 className="size-5 text-[#0170FE]" />
                Marketing Consent Engine Status
              </h3>
              <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                TCPA &amp; GLBA Compliant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify client consent before marketing automated quote reminders, SMS notifications, and policy reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#0060db]"
          >
            <Plus className="size-4" />
            Send Consent Request
          </button>
        </div>

        {/* Shareable Consent Request Link */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Broker Public Consent Intake Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={consentLink}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-mono text-slate-800 outline-none"
            />
            <button
              type="button"
              onClick={() => onCopy(consentLink, 'consent')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs sm:text-sm font-semibold hover:border-[#0170FE] hover:text-[#0170FE]"
            >
              {copiedKey === 'consent' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
              <span>{copiedKey === 'consent' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consent History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-950">Consent History &amp; Client Registry</h3>
          <span className="text-xs sm:text-sm font-medium text-slate-500">236 Consented · 8 Withdrawn · 4 Declined</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3">Client / Business</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Audit Verification Hash</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consentRecords.map((r) => (
                <tr key={r.client} className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-900">{r.client}</td>
                  <td className="py-3 text-slate-600">{r.contact}</td>
                  <td className="py-3 text-slate-500">{r.channel}</td>
                  <td className="py-3 text-slate-500">{r.date}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === 'Consented'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'Withdrawn'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-400">{r.hash}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={onSave}
                      className="cursor-pointer text-xs sm:text-sm font-semibold text-[#0170FE] hover:underline"
                    >
                      Audit Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  const leadUrl = 'https://brokerstep.app/lead/apex-horizon'
  const iframeSnippet = `<iframe src="${leadUrl}" width="100%" height="650" frameborder="0"></iframe>`

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Broker QR Code Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 lg:col-span-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <QrCode className="size-5 text-[#0170FE]" />
            Broker Dynamic QR Code
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Clients scan this QR code on physical business cards, office flyers, or signs to open your lead form.
          </p>
        </div>

        {/* QR Code Mockup Canvas */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="rounded-2xl border-4 border-[#0170FE] bg-white p-4 shadow-md">
            {/* High visual QR placeholder */}
            <div className="size-44 flex flex-col justify-between p-1 bg-white">
              <div className="flex justify-between">
                <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                  <div className="size-5 bg-[#0170FE]" />
                </div>
                <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                  <div className="size-5 bg-[#0170FE]" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-lg bg-[#0170FE] px-2 py-1 text-xs font-extrabold text-white">
                  BROKERSTEP
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                  <div className="size-5 bg-[#0170FE]" />
                </div>
                <div className="grid grid-cols-3 gap-1 size-9">
                  <div className="bg-slate-950" />
                  <div className="bg-[#0170FE]" />
                  <div className="bg-slate-950" />
                  <div className="bg-[#0170FE]" />
                  <div className="bg-slate-950" />
                  <div className="bg-[#0170FE]" />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-900">Apex Horizon Brokerage Intake</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Scan to Submit Quote Request</p>

          <div className="mt-4 flex gap-2 w-full">
            <button
              type="button"
              onClick={onSave}
              className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs hover:border-[#0170FE]"
            >
              <Download className="size-4" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={onSave}
              className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs hover:border-[#0170FE]"
            >
              <Download className="size-4" />
              Download SVG
            </button>
          </div>
        </div>

        {/* Lead Capture Link */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Direct Lead Capture URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={leadUrl}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-mono text-slate-800 outline-none"
            />
            <button
              type="button"
              onClick={() => onCopy(leadUrl, 'leadurl')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-semibold hover:border-[#0170FE] hover:text-[#0170FE]"
            >
              {copiedKey === 'leadurl' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Public Form Preview & Embed Code */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 lg:col-span-7">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Public Form Preview &amp; Embed</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Live preview of your branded lead generation form</p>
          </div>


        </div>

        {/* Interactive Form Preview Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-bold text-slate-800">
            <span className="size-2 rounded-full bg-emerald-500" />
            Apex Horizon Client Intake Form
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs font-medium mb-1">Client Name</span>
              <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-400">Jane Smith</div>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-medium mb-1">Phone</span>
              <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-400">(555) 000-0000</div>
            </div>
          </div>

          <div className="text-xs sm:text-sm">
            <span className="text-slate-500 block text-xs font-medium mb-1">Coverage Requested</span>
            <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 font-medium">
              Commercial Property &amp; General Liability
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-[#0170FE] py-2.5 text-center text-xs sm:text-sm font-semibold text-white pointer-events-none"
          >
            Submit Quote Request (Apex Horizon LLC)
          </button>
        </div>

        {/* Website Embed Code */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Embed Code for Your Brokerage Website (HTML iFrame)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={iframeSnippet}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-mono text-slate-600 outline-none"
            />
            <button
              type="button"
              onClick={() => onCopy(iframeSnippet, 'iframe')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs sm:text-sm font-semibold hover:border-[#0170FE] hover:text-[#0170FE]"
            >
              {copiedKey === 'iframe' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
              <span>{copiedKey === 'iframe' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs sm:text-sm">
          <p className="font-bold text-slate-900">Lead Alert Notifications</p>
          <div className="flex items-center justify-between text-slate-600">
            <span>Instant SMS notification on lead capture:</span>
            <span className="font-semibold text-emerald-600">Enabled (+1 555-234-5678)</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Instant Email alert:</span>
            <span className="font-semibold text-slate-800">jordan.davis@apexhorizon.com</span>
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
