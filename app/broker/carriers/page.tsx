import { redirect } from 'next/navigation'

export default function CarriersPage() {
  redirect('/broker/settings?tab=carriers')
}
