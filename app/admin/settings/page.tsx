'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Cog,
  Globe,
  Clock,
  Server,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
} from 'lucide-react'

type SettingsTabId = 'basic' | 'modules' | 'rbac'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'Super Admin' | 'Operations Admin' | 'Billing Admin' | 'Auditor'
  status: 'Active' | 'Suspended'
  lastActive: string
}

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'ADM-001',
    name: 'Alexandra Sterling',
    email: 'alexandra.sterling@brokerstep.com',
    role: 'Super Admin',
    status: 'Active',
    lastActive: '12 minutes ago',
  },
  {
    id: 'ADM-002',
    name: 'Marcus Vance',
    email: 'm.vance@brokerstep.com',
    role: 'Operations Admin',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    id: 'ADM-003',
    name: 'Elena Rostova',
    email: 'e.rostova@brokerstep.com',
    role: 'Billing Admin',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: 'ADM-004',
    name: 'David Chen',
    email: 'd.chen@brokerstep.com',
    role: 'Auditor',
    status: 'Active',
    lastActive: '3 days ago',
  },
]

function SettingsContent() {
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<SettingsTabId>('basic')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 1. Basic Platform Configuration State
  const [platformName, setPlatformName] = useState('BrokerStep Insurance Platform')
  const [supportEmail, setSupportEmail] = useState('support@brokerstep.com')
  const [supportPhone, setSupportPhone] = useState('+1 (888) 555-0199')
  const [timezone, setTimezone] = useState('America/New_York (EST)')
  const [currency, setCurrency] = useState('USD ($)')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // 2. Modules Configuration State
  // Membership
  const [defaultTrialDays, setDefaultTrialDays] = useState('14')
  const [gracePeriodDays, setGracePeriodDays] = useState('7')
  const [autoSuspendOnOverdue, setAutoSuspendOnOverdue] = useState(true)

  // Carriers
  const [globalCarrierCommissionBaseline, setGlobalCarrierCommissionBaseline] = useState('15.0')
  const [requireActiveCarrier, setRequireActiveCarrier] = useState(true)

  // Statement Templates
  const [headerDetectionThreshold, setHeaderDetectionThreshold] = useState('85')
  const [maxStatementFileSizeMb, setMaxStatementFileSizeMb] = useState('25')
  const [autoArchiveStatements, setAutoArchiveStatements] = useState(true)

  // 3. RBAC State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUser['role']>('Operations Admin')

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Handle URL tab parameter
  useEffect(() => {
    const applyUrlParams = () => {
      const tab = searchParams.get('tab') as SettingsTabId
      if (tab && ['basic', 'modules', 'rbac'].includes(tab)) {
        setActiveTab(tab)
      } else {
        setActiveTab('basic')
      }
    }

    applyUrlParams()

    const handleNavChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ search?: string; href?: string }>
      if (customEvent.detail?.search !== undefined) {
        const params = new URLSearchParams(customEvent.detail.search)
        const tab = params.get('tab') as SettingsTabId
        if (tab && ['basic', 'modules', 'rbac'].includes(tab)) {
          setActiveTab(tab)
        } else {
          setActiveTab('basic')
        }
      }
    }

    window.addEventListener('popstate', applyUrlParams)
    window.addEventListener('broker-nav-change', handleNavChange)
    return () => {
      window.removeEventListener('popstate', applyUrlParams)
      window.removeEventListener('broker-nav-change', handleNavChange)
    }
  }, [searchParams])

  function handleTabChange(tab: SettingsTabId) {
    setActiveTab(tab)
    const targetUrl = tab === 'basic' ? '/admin/settings' : `/admin/settings?tab=${tab}`
    const targetSearch = tab === 'basic' ? '' : `?tab=${tab}`
    window.history.pushState(null, '', targetUrl)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: targetUrl, search: targetSearch, pathname: '/admin/settings' },
      })
    )
  }

  function handleSaveAllSettings() {
    showToast('Platform settings saved and successfully applied across all modules.')
  }

  function handleResetDefaults() {
    if (confirm('Reset platform settings to recommended default values?')) {
      setPlatformName('BrokerStep Insurance Platform')
      setSupportEmail('support@brokerstep.com')
      setSupportPhone('+1 (888) 555-0199')
      setTimezone('America/New_York (EST)')
      setCurrency('USD ($)')
      setMaintenanceMode(false)
      setDefaultTrialDays('14')
      setGracePeriodDays('7')
      setAutoSuspendOnOverdue(true)
      setGlobalCarrierCommissionBaseline('15.0')
      setRequireActiveCarrier(true)
      setHeaderDetectionThreshold('85')
      setMaxStatementFileSizeMb('25')
      setAutoArchiveStatements(true)
      showToast('Platform settings restored to defaults.')
    }
  }

  // Handle Admin User Invite
  function handleInviteAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) return

    const newUser: AdminUser = {
      id: `ADM-00${adminUsers.length + 1}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Active',
      lastActive: 'Just invited',
    }

    setAdminUsers((prev) => [newUser, ...prev])
    setIsInviteModalOpen(false)
    setInviteName('')
    setInviteEmail('')
    showToast(`Administrative invitation sent to ${newUser.email}`)
  }

  // Toggle Admin Status
  function handleToggleAdminStatus(id: string) {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
          showToast(`Admin account ${u.name} marked as ${nextStatus}.`)
          return { ...u, status: nextStatus }
        }
        return u
      })
    )
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ───── Page Header ───── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md shadow-slate-950/20">
              <Cog className="size-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Platform Settings</h1>

              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Basic platform configuration, membership &amp; carrier policies, and administrative RBAC.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RotateCcw className="size-4 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllSettings}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-slate-950/20 hover:bg-blue-600 transition-all duration-150"
          >
            <Save className="size-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Maintenance Mode Alert Banner */}
      {maintenanceMode && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs sm:text-sm font-medium text-amber-900 shadow-xs">
          <AlertTriangle className="size-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Maintenance Mode is ACTIVE:</span> Broker portal logins are currently redirected to the scheduled maintenance notice.
          </div>
          <button
            type="button"
            onClick={() => setMaintenanceMode(false)}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* ───── Sub-Tabs (Broker-Style Unified Container) ───── */}
      <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'basic', label: 'Basic Platform Configuration', count: 'Core' },
            { id: 'modules', label: 'Membership, Carriers & Templates', count: 'SOW' },
            { id: 'rbac', label: 'Controlled Access & RBAC', count: adminUsers.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as SettingsTabId)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =========================================================================
         TAB 1: BASIC PLATFORM CONFIGURATION REQUIRED BY SOW
         ========================================================================= */}
      {activeTab === 'basic' && (
        <div className="mt-6 space-y-6">
          {/* Section: Platform Identity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Platform Identity &amp; Support</h3>
                <p className="text-xs text-slate-500">Core system naming and operational contact channels.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Globe className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Platform Brand Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section: Regional & Time Standards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Localization &amp; Currency Standards</h3>
                <p className="text-xs text-slate-500">System baseline for timezone and ledger currency.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">System Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                  <option value="America/Denver (MST)">America/Denver (MST)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                  <option value="UTC">UTC (Universal)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="USD ($)">United States Dollar (USD $)</option>
                  <option value="CAD ($)">Canadian Dollar (CAD $)</option>
                  <option value="EUR (€)">Euro (EUR €)</option>
                  <option value="GBP (£)">British Pound (GBP £)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Maintenance Mode */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">System Availability</h3>
                <p className="text-xs text-slate-500">Control broker portal access during scheduled maintenance windows.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Server className="size-4" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Platform Maintenance Mode</span>
                <span className="text-xs text-slate-500">
                  When active, brokers see a scheduled maintenance notice while administrators retain full access.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: MEMBERSHIP, CARRIERS & STATEMENT TEMPLATES CONFIGURATION
         ========================================================================= */}
      {activeTab === 'modules' && (
        <div className="mt-6 space-y-6">
          {/* Section 1: Membership Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Membership &amp; Billing Rules</h3>
                <p className="text-xs text-slate-500">Default subscription trial periods, grace deadlines, and account suspension.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Default Trial Period (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={defaultTrialDays}
                  onChange={(e) => setDefaultTrialDays(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-400">Granted to new registered brokers</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Payment Grace Period (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-400">Allowed before suspension after failed payment</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={autoSuspendOnOverdue}
                  onChange={(e) => setAutoSuspendOnOverdue(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Automatically suspend broker portal access after grace deadline expires</span>
              </label>
            </div>
          </div>

          {/* Section 2: Carrier Master Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Carriers &amp; Commission Defaults</h3>
                <p className="text-xs text-slate-500">Global carrier commission baseline and upload validation rules.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Default Baseline Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={globalCarrierCommissionBaseline}
                    onChange={(e) => setGlobalCarrierCommissionBaseline(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-400">Default baseline rate where carrier rate is unconfigured</span>
              </div>

              <div className="pt-4 flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requireActiveCarrier}
                    onChange={(e) => setRequireActiveCarrier(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Block statement uploads if carrier status is marked Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Statement Templates Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Statement Templates Engine</h3>
                <p className="text-xs text-slate-500">Ingestion file limits, auto-detection thresholds, and archiving.</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileSpreadsheet className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Max Statement File Size (MB)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={maxStatementFileSizeMb}
                    onChange={(e) => setMaxStatementFileSizeMb(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MB</span>
                </div>
                <span className="text-[11px] text-slate-400">Applies to CSV, XLSX, and text uploads</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Header Detection Confidence (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={headerDetectionThreshold}
                    onChange={(e) => setHeaderDetectionThreshold(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-400">Minimum confidence before prompting manual column review</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={autoArchiveStatements}
                  onChange={(e) => setAutoArchiveStatements(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Automatically move statement files to archive once fully mapped and reconciled</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 3: CONTROLLED ADMINISTRATIVE ACCESS & ROLE-BASED ACCESS CONTROL (RBAC)
         ========================================================================= */}
      {activeTab === 'rbac' && (
        <div className="mt-6 space-y-6">
          {/* Admin Directory */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Administrative Users</h3>
                <p className="text-xs text-slate-500">Controlled administrative access to the platform with role assignments.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition"
              >
                <Plus className="size-3.5" />
                <span>Invite Admin</span>
              </button>
            </div>

            {/* Admin Users Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Admin User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white font-bold text-xs shadow-xs">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-slate-500 font-mono text-[11px] block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-block ${user.role === 'Super Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : user.role === 'Operations Admin'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : user.role === 'Billing Admin'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                        {user.lastActive}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleAdminStatus(user.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role-Based Permissions Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-950">Role-Based Access Control (RBAC) Permissions Matrix</h3>
            <p className="text-xs text-slate-500">Defines exact administrative authority across platform operational modules.</p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Platform Module</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Operations Admin</th>
                    <th className="py-3 px-3 text-center">Billing Admin</th>
                    <th className="py-3 px-3 text-center">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { module: 'Platform & Global Settings', sa: 'Full Access', oa: 'View Only', ba: 'No Access', ca: 'View Only' },
                    { module: 'Membership Plans & Billing', sa: 'Full Access', oa: 'View Only', ba: 'Full Access', ca: 'View Only' },
                    { module: 'Carriers Master & Commission Config', sa: 'Full Access', oa: 'Full Access', ba: 'View Only', ca: 'View Only' },
                    { module: 'Statement Templates & Field Mapping', sa: 'Full Access', oa: 'Full Access', ba: 'No Access', ca: 'View Only' },
                    { module: 'Audit & Access Logs', sa: 'Full Access', oa: 'View Only', ba: 'View Only', ca: 'Full Export' },
                  ].map((row) => (
                    <tr key={row.module} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.module}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 font-bold text-[11px]">
                          {row.sa}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 font-bold text-[11px]">
                          {row.oa}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold text-[11px]">
                          {row.ba}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 font-bold text-[11px]">
                          {row.ca}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───── Invite Admin Modal ───── */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Invite Administrator</h3>
                  <p className="text-xs text-slate-500">Controlled administrative account provisioning.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleInviteAdmin} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@brokerstep.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Administrative Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminUser['role'])}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Super Admin">Super Admin (Full Access)</option>
                  <option value="Operations Admin">Operations Admin</option>
                  <option value="Billing Admin">Billing Admin</option>
                  <option value="Auditor">Auditor (View Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlatformSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
