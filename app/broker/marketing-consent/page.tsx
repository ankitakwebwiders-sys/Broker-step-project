import { redirect } from 'next/navigation'

export default function MarketingConsentPage() {
  redirect('/broker/settings?tab=consent')
}
