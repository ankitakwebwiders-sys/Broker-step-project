import { redirect } from 'next/navigation'

export default function QrLeadCapturePage() {
  redirect('/broker/settings?tab=qr-leads')
}
