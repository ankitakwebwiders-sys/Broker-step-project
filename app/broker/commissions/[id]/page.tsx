'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Edit3,
  TrendingDown,
  Scale,
  Send,
  Download,
  Receipt,
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import {
  initialCommissions,
  type CommissionItem,
  type CommissionReconciliationStatus,
  type CommissionAuditLog,
} from '@/data/broker/commissions'

export default function CommissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const txnId = resolvedParams.id

  const [commissions, setCommissions] = useState<CommissionItem[]>(initialCommissions)
  const [newNote, setNewNote] = useState('')

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [newStatusValue, setNewStatusValue] = useState<CommissionReconciliationStatus>('Reconciled')
  const [statusChangeReason, setStatusChangeReason] = useState('')

  const item = commissions.find(
    (c) => c.id === txnId || c.transactionNumber === txnId
  ) || commissions[0]

  const fmt = (val: number) => {
    const isNeg = val < 0
    const absVal = Math.abs(val)
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(absVal)
    return isNeg ? `-${formatted}` : formatted
  }

  function getReconciliationBadge(status: CommissionReconciliationStatus) {
    switch (status) {
      case 'Reconciled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Reconciled
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Clock className="size-3 text-amber-500" />
            Pending
          </span>
        )
      case 'Partial Paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
            <Scale className="size-3 text-indigo-500" />
            Partial Paid
          </span>
        )
      case 'Discrepancy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
            <AlertCircle className="size-3 text-rose-500" />
            Discrepancy
          </span>
        )
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Review
          </span>
        )
      case 'Chargeback':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 ring-1 ring-rose-300">
            <TrendingDown className="size-3 text-rose-600" />
            Chargeback
          </span>
        )
    }
  }

  function handleSaveStatusChange() {
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const newLog: CommissionAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: nowStr,
      user: 'Jordan Davis (Broker Account)',
      action: `Status manually changed to ${newStatusValue}`,
      previousStatus: item.reconciliationStatus,
      newStatus: newStatusValue,
      notes: statusChangeReason.trim() || 'Manual status adjustment recorded.',
    }

    const updated: CommissionItem = {
      ...item,
      reconciliationStatus: newStatusValue,
      auditHistory: [newLog, ...item.auditHistory],
    }

    setCommissions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setIsStatusModalOpen(false)
    setStatusChangeReason('')
  }

  function handleAddNote() {
    if (!newNote.trim()) return

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const newLog: CommissionAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: nowStr,
      user: 'Jordan Davis',
      action: 'Broker Note Added',
      notes: newNote.trim(),
    }

    const updated: CommissionItem = {
      ...item,
      notes: `${item.notes} [${newNote.trim()}]`,
      auditHistory: [newLog, ...item.auditHistory],
    }

    setCommissions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setNewNote('')
  }

  return (
    <div className="p-3.5 sm:p-5 md:p-7 max-w-[1400px] mx-auto space-y-5 sm:space-y-7">
      
      {/* ───── Top Back Navigation & Title ───── */}
      <div>
        <Link
          href="/broker/commissions"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-blue-600 transition mb-3"
        >
          <ArrowLeft className="size-3.5" />
          Back to Commissions Ledger
        </Link>

        <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-medium text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Section 8.3 · Commission Transaction Detail
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-slate-900 font-mono">
                {item.transactionNumber}
              </h1>
              {getReconciliationBadge(item.reconciliationStatus)}
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                {item.transactionType}
              </span>
            </div>
            <p className="mt-1 text-[12px] sm:text-[12.5px] text-slate-500">
              Detailed audit breakdown of transaction revenue, carrier statement reconciliation, and manual change history.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setNewStatusValue(item.reconciliationStatus)
                setIsStatusModalOpen(true)
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 sm:px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="size-3.5" />
              <span>Update Status</span>
            </button>
            <button
              onClick={() => alert(`Exporting statement ${item.statementSource} for ${item.transactionNumber}...`)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
            >
              <Download className="size-3.5 text-slate-500" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───── 8.3 Main Structured Content Grid ───── */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Client and Policy */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                  Client and Policy
                </h2>
              </div>
              <Link href="/broker/clients" className="text-[11.5px] font-medium text-blue-600 hover:underline">
                View Client Profile &rarr;
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[12.5px]">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400 block">Insured Client</span>
                <span className="font-semibold text-slate-900 text-[13px] block mt-0.5">{item.clientName}</span>
                <span className="text-slate-500 text-[11.5px] block">{item.businessName}</span>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-[11.5px] text-slate-600">
                  <span className="flex items-center gap-1.5"><Phone className="size-3 text-slate-400" /> {item.clientPhone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="size-3 text-slate-400" /> {item.clientEmail}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400 block">Policy Details</span>
                <span className="font-mono font-bold text-slate-900 text-[13px] block mt-0.5">{item.policyNumber}</span>
                <span className="text-slate-600 text-[11.5px] block">{item.lineOfBusiness}</span>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">Underwriting Carrier:</span>
                  <span className="font-semibold text-slate-900">{item.carrier}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Carrier, Transaction Type & Statement Source */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Receipt className="size-4 text-blue-600" />
              <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                Carrier &amp; Transaction Details
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-[12.5px]">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Carrier</span>
                <span className="font-bold text-slate-900 mt-1 block truncate">{item.carrier}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Transaction Type</span>
                <span className="font-semibold text-slate-900 mt-1 block truncate">{item.transactionType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Transaction Date</span>
                <span className="font-medium text-slate-800 mt-1 block">{item.transactionDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Statement Source</span>
                <span className="font-mono font-bold text-blue-600 mt-1 block truncate">{item.statementSource}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Ledger Breakdown */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600" />
                <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                  Financial Commission Breakdown
                </h2>
              </div>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 font-mono">Statement #{item.statementSource}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-[12.5px]">
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Premium</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-900 block mt-1">{fmt(item.premium)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Commission Rate</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-blue-600 block mt-1">{item.commissionRate}%</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Expected Commission</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-800 block mt-1">{fmt(item.expectedCommission)}</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
                <span className="text-[11px] text-emerald-700 block font-medium">Actual / Paid Commission</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-emerald-700 block mt-1">{fmt(item.actualPaidCommission)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Additional Commission</span>
                <span className="text-[15px] sm:text-[16px] font-semibold text-slate-900 block mt-1">+{fmt(item.additionalCommission)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Chargeback</span>
                <span className="text-[15px] sm:text-[16px] font-semibold text-rose-600 block mt-1">{fmt(item.chargeback)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Adjustment / Reversal</span>
                <span className="text-[15px] sm:text-[16px] font-semibold text-purple-700 block mt-1">{fmt(item.adjustment)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950 text-white shadow-2xs">
                <span className="text-[11px] text-slate-300 block font-medium">Net Commission</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-white block mt-1">{fmt(item.netCommission)}</span>
              </div>
            </div>

            {/* Difference / Variance Highlight */}
            {item.expectedCommission !== item.actualPaidCommission && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-3.5 text-[12px] text-amber-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  Variance Delta: {fmt(item.expectedCommission - item.actualPaidCommission)}
                </p>
                <p className="mt-0.5 text-[11.5px] text-amber-800">
                  Calculated expected revenue differs from confirmed carrier remittance payout.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: History of Manual Status Changes (Audit Log) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="size-4 text-blue-600 shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                  History of Manual Status Changes (Audit Trail)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Recorded user actions, date-time, and audit rationale for compliance.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80 touch-pan-x">
              <table className="w-full min-w-[500px] text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-2.5">Date &amp; Time</th>
                    <th className="px-3 py-2.5">User</th>
                    <th className="px-3 py-2.5">Status Transition</th>
                    <th className="px-3.5 py-2.5">Audit Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {item.auditHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-3.5 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {log.user}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {log.newStatus ? (
                          <div className="flex items-center gap-1.5">
                            {log.previousStatus && (
                              <span className="line-through text-slate-400 text-[11px]">{log.previousStatus}</span>
                            )}
                            {log.previousStatus && <span className="text-slate-400">&rarr;</span>}
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 font-semibold ring-1 ring-blue-200 text-[10.5px]">
                              {log.newStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">{log.action}</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-slate-600">
                        {log.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Status & Notes */}
        <div className="space-y-6">

          {/* Net Commission Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950 text-white p-5 shadow-lg">
            <span className="text-[12px] font-medium text-slate-400">Total Net Commission</span>
            <p className="mt-2 text-[32px] font-bold tracking-tight text-white">{fmt(item.netCommission)}</p>
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-[12px] text-slate-300">
              <div className="flex justify-between">
                <span>Expected Amount:</span>
                <strong className="text-white font-mono">{fmt(item.expectedCommission)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Actual Deposited:</span>
                <strong className="text-emerald-400 font-mono">{fmt(item.actualPaidCommission)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Reconciliation State:</span>
                <span className="font-semibold text-white">{item.reconciliationStatus}</span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="size-4 text-blue-600" />
              <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                Notes
              </h2>
            </div>
            
            <p className="rounded-xl bg-slate-50 p-3.5 text-[12px] text-slate-700 leading-relaxed border border-slate-100">
              {item.notes}
            </p>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Add Broker Accounting Remark</label>
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal remark or reconciliation inquiry..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] outline-none focus:border-blue-400"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-[12px] font-semibold text-white hover:bg-blue-600 disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="size-3.5" />
                Save Remark
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ───── Update Reconciliation Status Modal ───── */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-[calc(100%-1rem)] sm:w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-6 shadow-2xl">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900">Update Reconciliation Status</h3>
            <p className="mt-1 text-[11.5px] sm:text-[12px] text-slate-500">
              Manually change the status for transaction <strong className="font-mono text-slate-900">{item.transactionNumber}</strong>.
            </p>

            <div className="mt-4 space-y-3 text-[12px]">
              <div>
                <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">New Status</label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as CommissionReconciliationStatus)}
                  className="w-full h-9.5 rounded-xl border border-slate-200 px-3 text-[12.5px] font-medium outline-none cursor-pointer"
                >
                  <option value="Reconciled">Reconciled</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial Paid">Partial Paid</option>
                  <option value="Discrepancy">Discrepancy</option>
                  <option value="In Review">In Review</option>
                  <option value="Chargeback">Chargeback</option>
                </select>
              </div>

              <div>
                <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">Audit Reason / Remark *</label>
                <textarea
                  rows={2.5}
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Reason for manual status change..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatusChange}
                className="flex-1 sm:flex-initial rounded-xl bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-600 transition cursor-pointer text-center whitespace-nowrap"
              >
                Save &amp; Record Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
