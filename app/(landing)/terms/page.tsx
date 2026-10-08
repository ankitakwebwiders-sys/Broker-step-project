import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-30 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Agreement to Terms</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              By accessing or using BrokerStep, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Accounts</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">Account Registration</h3>
                <p className="mt-2 text-slate-600">
                  You must create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account and password.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">Account Responsibilities</h3>
                <p className="mt-2 text-slate-600">
                  You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Subscription Plans</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              BrokerStep offers various subscription plans. You agree to pay all fees associated with your selected plan. Fees are non-refundable except as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Acceptable Use</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              You agree not to use the service for any unlawful purpose, to solicit others to perform unlawful acts, or to violate any international, federal, provincial, or state regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Intellectual Property</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              The service and its original content, features, and functionality are owned by BrokerStep and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Termination</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              We may terminate or suspend your account at any time without prior notice for any reason, including but not limited to a breach of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Limitation of Liability</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              In no event shall BrokerStep be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Governing Law</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the state of California, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Changes to Terms</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-950">Contact Us</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 space-y-1 text-slate-600">
              <p>Email: legal@brokerstep.com</p>
              <p>Address: BrokerStep Inc., 123 Business Ave, Suite 100, San Francisco, CA 94105</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
