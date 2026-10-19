'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  ArrowLeft,
  Check,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { type ClientItem } from '@/data/broker/clients'

const QUICK_EMAIL_DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com']

const SAMPLE_CANADIAN_ADDRESSES = [
  { street: '100 King Street West, Suite 5600', city: 'Toronto', province: 'ON', postalCode: 'M5X 1C9' },
  { street: '200 Bay Street, Suite 1200', city: 'Toronto', province: 'ON', postalCode: 'M5J 2J2' },
  { street: '1055 West Georgia Street, Suite 1500', city: 'Vancouver', province: 'BC', postalCode: 'V6E 3P3' },
  { street: '666 Burrard Street', city: 'Vancouver', province: 'BC', postalCode: 'V6C 2X8' },
  { street: '1000 Rue de la Gauchetière Ouest', city: 'Montreal', province: 'QC', postalCode: 'H3B 4W5' },
  { street: '855 2nd Street SW, 8th Floor', city: 'Calgary', province: 'AB', postalCode: 'T2P 4J8' },
  { street: '50 O\'Connor Street, Suite 300', city: 'Ottawa', province: 'ON', postalCode: 'K1P 6L2' },
  { street: '10020 100 Street NW', city: 'Edmonton', province: 'AB', postalCode: 'T5J 0N3' },
  { street: '201 Portage Avenue', city: 'Winnipeg', province: 'MB', postalCode: 'R3B 3K6' },
  { street: '1959 Upper Water Street', city: 'Halifax', province: 'NS', postalCode: 'B3J 3N2' },
]

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
]

const LOB_OPTIONS = [
  'Auto',
  'Home',
  'Commercial',
  'Commercial Auto',
  'General Liability',
  'Commercial Property',
  'Professional Liability',
  'Cyber Liability',
  'Workers Comp',
  'Business Owners',
  'Travel',
  'Life',
]

const INSURER_SUGGESTIONS = [
  'Travelers Canada',
  'Intact Insurance',
  'Aviva Canada',
  'Wawanesa Mutual Insurance',
  'Chubb Insurance Company of Canada',
  'The Hartford',
  'Economical / Definity Insurance',
  'Northbridge Financial',
  'Gore Mutual Insurance',
  'Desjardins Insurance',
  'Liberty Mutual Canada',
  'AIG Canada',
  'Lloyd\'s of London',
]

function getExpiryFromEffective(effDate: string): string {
  if (!effDate) return ''
  const parts = effDate.split('-')
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    if (!isNaN(y)) {
      return `${y + 1}-${parts[1]}-${parts[2]}`
    }
  }
  return ''
}

function AddClientFormContent() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    clientType: 'Individual' as 'Individual' | 'Commercial',
    dob: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: 'ON',
    postalCode: '',
    status: 'Active / Submitted',
    linesOfBusiness: ['Auto'] as string[],
    insurerName: 'Travelers Canada',
    policyNumber: '',
    isPendingPolicyNumber: false,
    effectiveDate: today,
    expirationDate: getExpiryFromEffective(today),
    yearlyPremium: '',
    commissionRate: 15.0,
    brokerSplit: 80,
    consentStatus: 'Granted' as 'Granted' | 'Pending' | 'Declined',
    consentChannels: ['Email', 'Phone', 'SMS'] as string[],
    consentNotes: 'Intake consent confirmed verbally / on client form.',
    notes: '',
  })

  const [addressSearchQuery, setAddressSearchQuery] = useState('')
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectAddress = (item: (typeof SAMPLE_CANADIAN_ADDRESSES)[0]) => {
    setForm((prev) => ({
      ...prev,
      street: item.street,
      city: item.city,
      province: item.province,
      postalCode: item.postalCode,
    }))
    setAddressSearchQuery('')
    setIsAddressDropdownOpen(false)
  }

  const handleEffectiveDateChange = (dateVal: string) => {
    setForm((prev) => ({
      ...prev,
      effectiveDate: dateVal,
      expirationDate: getExpiryFromEffective(dateVal),
    }))
  }

  const handleToggleChannel = (channel: string) => {
    setForm((prev) => {
      const exists = prev.consentChannels.includes(channel)
      return {
        ...prev,
        consentChannels: exists
          ? prev.consentChannels.filter((c) => c !== channel)
          : [...prev.consentChannels, channel],
      }
    })
  }

  const handleSave = (e: React.FormEvent, andAddAnother = false) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert('Please enter both First Name and Last Name.')
      return
    }

    setIsSubmitting(true)

    const newId = `CL-${Math.floor(1000 + Math.random() * 9000)}`
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
    const polNum = form.isPendingPolicyNumber
      ? 'POL-PENDING'
      : form.policyNumber.trim() || `POL-${Math.floor(10000 + Math.random() * 90000)}`

    const newClient: ClientItem = {
      id: newId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: fullName,
      businessName: form.businessName.trim() || '—',
      clientType: form.clientType,
      clientSince: 'Today',
      dob: form.dob || '—',
      phone: form.phone.trim() || '+1 (416) 555-0100',
      email: form.email.trim() || `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase()}@client.com`,
      street: form.street.trim() || '100 King Street West',
      city: form.city.trim() || 'Toronto',
      state: form.province,
      province: form.province,
      zip: form.postalCode.trim() || 'M5X 1C9',
      postalCode: form.postalCode.trim() || 'M5X 1C9',
      brokerCode: 'BRK-8821',
      otherIdentifier: `ID-${Math.floor(10000 + Math.random() * 90000)}`,
      status: form.status,
      linesOfBusiness: form.linesOfBusiness,
      yearlyPremium: form.yearlyPremium ? `$${form.yearlyPremium}` : '$2,450',
      insurerName: form.insurerName,
      marketingConsent: {
        status: form.consentStatus,
        channels: form.consentChannels,
        consentDate: today,
        method: 'Client Intake Form',
        notes: form.consentNotes,
      },
      notes: form.notes.trim()
        ? [
          {
            id: `note-${Date.now()}`,
            date: 'Today',
            author: 'You (Broker)',
            text: form.notes.trim(),
          },
        ]
        : [],
      lastActivity: {
        description: 'Client profile registered via intake form',
        time: 'Just now',
      },
      policies: [
        {
          id: `pol-${Date.now()}`,
          policyNumber: polNum,
          type: form.linesOfBusiness[0] || 'Auto',
          carrier: form.insurerName,
          premium: form.yearlyPremium ? `$${form.yearlyPremium}` : '$2,450',
          effectiveDate: form.effectiveDate,
          expirationDate: form.expirationDate,
          status: 'Active',
          policyNumberPending: form.isPendingPolicyNumber,
          policyNumberSubtext: form.isPendingPolicyNumber ? 'Pending issuance from insurer' : undefined,
          rateSplit: `${form.commissionRate}% / ${form.brokerSplit}%`,
          expectedCommission: `$${Math.round(
            (parseFloat(form.yearlyPremium || '2450') * (form.commissionRate / 100) * (form.brokerSplit / 100)) || 294
          )}`,
          commissionStatus: 'Pending',
        },
      ],
      commissions: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Client Intake Form Submitted',
          type: 'system',
          date: 'Today',
          detail: `Initial record created with ${form.insurerName} coverage.`,
          actor: 'Broker Intake',
        },
      ],
    }

    try {
      const existing = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = existing ? JSON.parse(existing) : []
      localStorage.setItem('broker_custom_clients', JSON.stringify([newClient, ...currentList]))
    } catch (err) {
      console.error(err)
    }

    setIsSubmitting(false)

    if (andAddAnother) {
      setSuccessBanner(`Client "${fullName}" (${newId}) was saved successfully! You can add another client below.`)
      setForm({
        firstName: '',
        lastName: '',
        businessName: '',
        clientType: 'Individual',
        dob: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        province: 'ON',
        postalCode: '',
        status: 'Active / Submitted',
        linesOfBusiness: ['Auto'],
        insurerName: 'Travelers Canada',
        policyNumber: '',
        isPendingPolicyNumber: false,
        effectiveDate: today,
        expirationDate: getExpiryFromEffective(today),
        yearlyPremium: '',
        commissionRate: 15.0,
        brokerSplit: 80,
        consentStatus: 'Granted',
        consentChannels: ['Email', 'Phone', 'SMS'],
        consentNotes: 'Intake consent confirmed verbally / on client form.',
        notes: '',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(`/broker/book-of-business?view=details&id=${newId}`)
    }
  }

  return (
    <div className="p-4 sm:p-7 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <Link
          href="/broker/book-of-business"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#0170FE] transition cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to My Book</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">Broker Intake · New Client Setup</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0170FE]/10 text-[#0170FE] shadow-xs">
            <UserPlus className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Add New Client
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Complete client identity, contact information, primary policy coverage, <br />and compliance setup.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/broker/book-of-business"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSave(e, false)}
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] disabled:opacity-50"
          >
            <Check className="size-4" />
            <span>Save Client</span>
          </button>
        </div>
      </div>

      {/* Success Banner if adding multiple */}
      {successBanner && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs sm:text-sm text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={(e) => handleSave(e, false)} className="space-y-6">
        {/* SECTION 1: Client Identity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">Client Identity</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="e.g. Marcus"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="e.g. Vance"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business / Company Name <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="e.g. Vance Logistics LLC"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Classification
              </label>
              <select
                value={form.clientType}
                onChange={(e) => setForm({ ...form, clientType: e.target.value as any })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Individual">Individual Policyholder</option>
                <option value="Commercial">Commercial / Business</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Account Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Active / Submitted">Active / Submitted</option>
                <option value="Pending">Pending Review</option>
                <option value="Lead">Lead Intake</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Contact Information & Location */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">Contact &amp; Location Details</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (416) 555-0192"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="marcus.vance@gmail.com"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>

              {/* Quick domain autofill tags */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {QUICK_EMAIL_DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      const prefix = form.email.split('@')[0] || form.firstName.toLowerCase() || 'client'
                      setForm({ ...form, email: `${prefix}${domain}` })
                    }}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canadian Address with autocomplete helper */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address <span className="text-slate-400 font-normal">(search Canadian address or type manually)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => {
                    setForm({ ...form, street: e.target.value })
                    setAddressSearchQuery(e.target.value)
                    setIsAddressDropdownOpen(true)
                  }}
                  onFocus={() => setIsAddressDropdownOpen(true)}
                  placeholder="e.g. 100 King Street West, Suite 5600"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isAddressDropdownOpen && addressSearchQuery.length > 1 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {SAMPLE_CANADIAN_ADDRESSES.filter((a) =>
                    a.street.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
                    a.city.toLowerCase().includes(addressSearchQuery.toLowerCase())
                  ).slice(0, 5).map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs hover:bg-blue-50 transition cursor-pointer"
                    >
                      <MapPin className="size-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">{addr.street}</p>
                        <p className="text-[11px] text-slate-500">{addr.city}, {addr.province} {addr.postalCode}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsAddressDropdownOpen(false)}
                    className="w-full text-center py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 border-t border-slate-100 mt-1"
                  >
                    Close suggestions
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Toronto"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Province</label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                >
                  {CANADIAN_PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. M5X 1C9"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-semibold uppercase text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Primary Policy & Coverage Setup */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900">Primary Policy &amp; Coverage Setup</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Automatic contract split calculation</span>
          </div>

          {/* Line of Business Multi-Select Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Line of Business <span className="text-slate-400 font-normal">(Multiple selections supported, e.g. Auto & Home)</span> <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-medium text-blue-600">
                {form.linesOfBusiness.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOB_OPTIONS.map((line) => {
                const isSelected = form.linesOfBusiness.includes(line)
                return (
                  <button
                    key={line}
                    type="button"
                    onClick={() => {
                      setForm((prev) => {
                        const exists = prev.linesOfBusiness.includes(line)
                        if (exists && prev.linesOfBusiness.length === 1) return prev // keep at least 1
                        return {
                          ...prev,
                          linesOfBusiness: exists
                            ? prev.linesOfBusiness.filter((l) => l !== line)
                            : [...prev.linesOfBusiness, line],
                        }
                      })
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${isSelected
                        ? 'bg-slate-950 text-white shadow-xs hover:bg-slate-800'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {isSelected && <Check className="size-3.5 text-emerald-400" />}
                    <span>{line}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Insurance Carrier / Insurer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="insurer-list"
                value={form.insurerName}
                onChange={(e) => setForm({ ...form, insurerName: e.target.value })}
                placeholder="Select or type insurer (e.g. Travelers Canada)..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
              <datalist id="insurer-list">
                {INSURER_SUGGESTIONS.map((ins) => (
                  <option key={ins} value={ins} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Annual Gross Premium ($ CAD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.yearlyPremium}
                  onChange={(e) => setForm({ ...form, yearlyPremium: e.target.value })}
                  placeholder="2450.00"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Policy Number</label>
                <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={form.isPendingPolicyNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isPendingPolicyNumber: e.target.checked,
                        policyNumber: e.target.checked ? 'POL-PENDING' : '',
                      })
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Pending</span>
                </label>
              </div>
              <input
                type="text"
                disabled={form.isPendingPolicyNumber}
                value={form.isPendingPolicyNumber ? 'POL-PENDING (will fill from statement)' : form.policyNumber}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
                placeholder="e.g. POL-88210-TRAV"
                className={`h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-mono font-medium outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20 ${form.isPendingPolicyNumber ? 'bg-amber-50/70 text-amber-700 border-amber-200' : 'bg-white text-slate-900'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Effective Date</label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => handleEffectiveDateChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Expiration Date</label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ring-1 ring-emerald-200">
                  +1 Yr Auto
                </span>
              </div>
              <input
                type="date"
                readOnly
                value={form.expirationDate}
                title="Expiry date is automatically linked to exact one year after effective date."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Commission & Split Rates Preview */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Percent className="size-4 text-[#0170FE]" />
                Contract Commission Split
              </span>
              <span className="font-mono text-emerald-700 font-bold">
                Broker: {form.brokerSplit}% · House: {100 - form.brokerSplit}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Broker Share (%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={form.brokerSplit}
                  onChange={(e) => setForm({ ...form, brokerSplit: parseInt(e.target.value) || 0 })}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Marketing Consent & Compliance (CASL / PIPEDA) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                4
              </span>
              <h2 className="text-base font-bold text-slate-900">Marketing Consent &amp; Compliance</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              CASL Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consent Status
              </label>
              <select
                value={form.consentStatus}
                onChange={(e) => setForm({ ...form, consentStatus: e.target.value as any })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Granted">Granted (Opted In)</option>
                <option value="Pending">Pending Confirmation</option>
                <option value="Declined">Declined (Do Not Solicit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Allowed Communication Channels
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Email', 'SMS', 'Phone', 'Direct Mail'].map((channel) => {
                  const isChecked = form.consentChannels.includes(channel)
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => handleToggleChannel(channel)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${isChecked
                        ? 'bg-blue-50 text-[#0170FE] border border-blue-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <Check className={`size-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{channel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Automated Marketing Consent Notification Banner */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 flex items-start gap-2.5">
            <Shield className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Automated Consent Dispatch
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                A digital consent link will automatically be dispatched to the client upon saving. Once digitally authorized, their record automatically updates to <strong className="font-semibold text-emerald-900">Granted</strong> in the client file.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial Broker Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Bound primary commercial policy during annual review. Client expressed interest in umbrella endorsement next quarter."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <Link
            href="/broker/book-of-business"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 text-center hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSave(e, true)}
              className="w-full sm:w-auto rounded-xl border border-[#0170FE] bg-blue-50/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#0170FE] hover:bg-blue-100/70 transition cursor-pointer disabled:opacity-50"
            >
              Save &amp; Add Another
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] cursor-pointer disabled:opacity-50"
            >
              <Check className="size-4" />
              <span>Save Client &amp; View in My Book</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function AddClientPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      }
    >
      <AddClientFormContent />
    </Suspense>
  )
}
