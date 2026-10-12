import { redirect } from 'next/navigation'

export default function MembershipPage() {
  redirect('/broker/settings?tab=membership')
}
