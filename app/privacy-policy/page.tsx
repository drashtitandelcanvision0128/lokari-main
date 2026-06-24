import Link from 'next/link'

const LAST_UPDATED = 'June 2025'
const COMPANY = 'Lokhari Agri Exchange Pvt. Ltd.'
const EMAIL = 'privacy@lokhari.in'

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 font-headline text-xl font-bold text-[#0b5d68]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  )
}

const TOC = [
  { id: 'information',   label: 'Information We Collect'         },
  { id: 'use',           label: 'How We Use Your Information'    },
  { id: 'sharing',       label: 'Information Sharing'            },
  { id: 'storage',       label: 'Data Storage & Security'        },
  { id: 'cookies',       label: 'Cookies & Tracking'             },
  { id: 'rights',        label: 'Your Rights'                    },
  { id: 'retention',     label: 'Data Retention'                 },
  { id: 'children',      label: 'Children\'s Privacy'            },
  { id: 'changes',       label: 'Changes to This Policy'         },
  { id: 'contact',       label: 'Contact Us'                     },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] px-4 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[0.85rem]">shield</span>
            Legal
          </div>
          <h1 className="font-headline text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-white/80">Last updated: {LAST_UPDATED}</p>
          <p className="mt-2 text-sm text-white/70">
            This policy explains how {COMPANY} collects, uses, and protects your personal information.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* Sticky Table of Contents */}
          <aside className="shrink-0 lg:w-56">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Contents</p>
              <nav className="space-y-2">
                {TOC.map(({ id, label }) => (
                  <a key={id} href={`#${id}`}
                    className="block rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-[#0b5d68]/5 hover:text-[#0b5d68]">
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1 space-y-10">
            <div className="rounded-2xl border border-[#2eb5c2]/20 bg-[#f0fafb] px-5 py-4 text-sm text-[#0b5d68]">
              <strong>Summary:</strong> We collect only what we need, never sell your data, and give you full control over your information. Read on for details.
            </div>

            <Section id="information" title="1. Information We Collect">
              <p><strong className="text-gray-800">Account Information:</strong> When you register, we collect your name, email address, phone number, role (farmer, trader, etc.), and address for KYC verification.</p>
              <p><strong className="text-gray-800">Profile Data:</strong> Profile photo, business name, farm/warehouse location, vehicle type, and bio that you choose to provide.</p>
              <p><strong className="text-gray-800">Transaction Data:</strong> Details of listings you post, bids you place or receive, orders, and payment records necessary for marketplace operations.</p>
              <p><strong className="text-gray-800">Usage Data:</strong> Log data such as IP address, browser type, pages visited, and timestamps to improve platform performance and security.</p>
              <p><strong className="text-gray-800">Communications:</strong> Messages you send through our platform and support correspondence.</p>
            </Section>

            <Section id="use" title="2. How We Use Your Information">
              <ul className="list-inside list-disc space-y-2">
                <li>To create and manage your account and verify your identity (KYC).</li>
                <li>To facilitate transactions between buyers, sellers, and logistics providers.</li>
                <li>To send transactional notifications (bid alerts, order updates, payment confirmations).</li>
                <li>To provide real-time market intelligence and personalized insights.</li>
                <li>To improve, personalise, and develop new platform features.</li>
                <li>To detect, prevent, and respond to fraud, abuse, and security incidents.</li>
                <li>To comply with applicable Indian law and regulatory requirements.</li>
              </ul>
            </Section>

            <Section id="sharing" title="3. Information Sharing">
              <p>We <strong className="text-gray-800">do not sell</strong> your personal data to third parties. We may share data only in the following limited circumstances:</p>
              <ul className="list-inside list-disc space-y-2">
                <li><strong className="text-gray-800">Other Platform Users:</strong> Your name, location, listing details, and ratings are visible to counterparties as part of normal marketplace activity.</li>
                <li><strong className="text-gray-800">Service Providers:</strong> Trusted processors (payment gateways, cloud storage, email services) that operate under strict data-processing agreements.</li>
                <li><strong className="text-gray-800">Legal Obligations:</strong> Government and regulatory authorities when required by Indian law (e.g., Income Tax, GST authorities).</li>
                <li><strong className="text-gray-800">Business Transfers:</strong> In the event of a merger or acquisition, data may transfer to the new entity under the same privacy commitments.</li>
              </ul>
            </Section>

            <Section id="storage" title="4. Data Storage & Security">
              <p>Your data is stored on secure servers located in India. We implement industry-standard security measures including:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>TLS/HTTPS encryption for all data in transit.</li>
                <li>AES-256 encryption for sensitive data at rest.</li>
                <li>Role-based access controls and audit logging.</li>
                <li>Regular security audits and vulnerability assessments.</li>
                <li>Two-factor authentication for administrative access.</li>
              </ul>
              <p>No method of transmission over the internet is 100% secure. We strive to protect your data but cannot guarantee absolute security.</p>
            </Section>

            <Section id="cookies" title="5. Cookies & Tracking">
              <p>We use the following types of cookies and local storage:</p>
              <ul className="list-inside list-disc space-y-2">
                <li><strong className="text-gray-800">Essential:</strong> Authentication tokens and session data required for the platform to function.</li>
                <li><strong className="text-gray-800">Functional:</strong> Theme preferences, language settings, and UI state.</li>
                <li><strong className="text-gray-800">Analytics:</strong> Aggregate, anonymised usage statistics to improve the platform. No personally identifiable data is shared with analytics providers.</li>
              </ul>
              <p>You can control cookies through your browser settings. Disabling essential cookies may prevent you from using the platform.</p>
            </Section>

            <Section id="rights" title="6. Your Rights">
              <p>Under applicable Indian data protection law, you have the right to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li><strong className="text-gray-800">Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong className="text-gray-800">Correction:</strong> Update inaccurate or incomplete data via your profile settings.</li>
                <li><strong className="text-gray-800">Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements).</li>
                <li><strong className="text-gray-800">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                <li><strong className="text-gray-800">Withdraw Consent:</strong> Opt out of non-essential communications at any time.</li>
              </ul>
              <p>To exercise any of these rights, email us at <a href={`mailto:${EMAIL}`} className="font-medium text-[#2eb5c2] hover:underline">{EMAIL}</a>. We respond within 30 days.</p>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <p>We retain your personal data for as long as your account is active or as needed to provide services. After account deletion:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Transaction records are retained for 7 years to comply with financial regulations.</li>
                <li>KYC documents are retained for the period prescribed by applicable law.</li>
                <li>All other data is permanently deleted within 90 days of account closure.</li>
              </ul>
            </Section>

            <Section id="children" title="8. Children's Privacy">
              <p>Lokhari is not intended for persons under the age of 18. We do not knowingly collect personal information from minors. If we discover that we have inadvertently collected data from a minor, we will delete it promptly. If you believe a minor has provided us data, please contact us at <a href={`mailto:${EMAIL}`} className="font-medium text-[#2eb5c2] hover:underline">{EMAIL}</a>.</p>
            </Section>

            <Section id="changes" title="9. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. Material changes will be notified to you via email or a prominent banner on the platform at least 14 days before they take effect. Continued use of Lokhari after changes take effect constitutes acceptance of the updated policy.</p>
            </Section>

            <Section id="contact" title="10. Contact Us">
              <p>For privacy-related queries, requests, or complaints:</p>
              <div className="mt-3 rounded-xl border border-gray-100 bg-white p-5">
                <p className="font-semibold text-gray-800">{COMPANY}</p>
                <p className="mt-1">Email: <a href={`mailto:${EMAIL}`} className="font-medium text-[#2eb5c2] hover:underline">{EMAIL}</a></p>
                <p className="mt-1 text-gray-500">Response time: within 30 business days</p>
              </div>
            </Section>

            {/* Bottom nav */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-8">
              <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-[#0b5d68] hover:underline">
                <span className="material-symbols-outlined text-[1rem]">home</span>
                Back to Home
              </Link>
              <Link href="/terms" className="flex items-center gap-1.5 text-sm font-medium text-[#2eb5c2] hover:underline">
                Terms &amp; Conditions
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
