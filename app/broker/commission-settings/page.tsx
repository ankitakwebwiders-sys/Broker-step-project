import { redirect } from 'next/navigation'

export default function CommissionSettingsPage() {
  redirect('/broker/settings?tab=commissions')
}
