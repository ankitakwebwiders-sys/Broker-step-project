import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-30 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Introduction</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              BrokerStep (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our brokerage workspace platform. Please read this policy carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Information We Collect</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">Personal Information</h3>
                <p className="mt-2 text-slate-600">
                  We collect information you provide directly, including your name, email address, phone number, and other contact details when you create an account or use our services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">Account Information</h3>
                <p className="mt-2 text-slate-600">
                  We collect information about your brokerage, including client data, policy information, commission records, and other business-related data you store in our platform.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">Usage Data</h3>
                <p className="mt-2 text-slate-600">
                  We collect information about how you use our services, including login times, pages visited, features used, and other usage metrics to improve our services.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">How We Use Your Information</h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>• To provide, maintain, and improve our services</li>
              <li>• To process transactions and send related information</li>
              <li>• To send technical notices and support messages</li>
              <li>• To respond to your comments and questions</li>
              <li>• To monitor and analyze trends, usage, and activities</li>
              <li>• To detect, prevent, and address technical issues and fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Data Security</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Data Retention</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Your Rights</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              You have the right to access, correct, or delete your personal information. You may also opt out of certain communications. To exercise these rights, please contact us at privacy@brokerstep.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Contact Us</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 space-y-1 text-slate-600">
              <p>Email: privacy@brokerstep.com</p>
              <p>Address: BrokerStep Inc., 123 Business Ave, Suite 100, San Francisco, CA 94105</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
