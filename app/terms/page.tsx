import Link from 'next/link'

const LAST_UPDATED = 'June 2025'
const COMPANY = 'Lokhari Agri Exchange Pvt. Ltd.'
const EMAIL = 'legal@lokhari.in'

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
  { id: 'eligibility',    label: 'Eligibility'                    },
  { id: 'account',        label: 'Account Registration'           },
  { id: 'listings',       label: 'Listings & Transactions'        },
  { id: 'payments',       label: 'Payments & Escrow'              },
  { id: 'conduct',        label: 'Prohibited Conduct'             },
  { id: 'kyc',            label: 'KYC & Verification'             },
  { id: 'ip',             label: 'Intellectual Property'          },
  { id: 'liability',      label: 'Limitation of Liability'        },
  { id: 'dispute',        label: 'Dispute Resolution'             },
  { id: 'termination',    label: 'Termination'                    },
  { id: 'governing',      label: 'Governing Law'                  },
  { id: 'contact',        label: 'Contact'                        },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] px-4 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[0.85rem]">gavel</span>
            Legal
          </div>
          <h1 className="font-headline text-3xl font-bold sm:text-4xl">Terms &amp; Conditions</h1>
          <p className="mt-3 text-sm text-white/80">Last updated: {LAST_UPDATED}</p>
          <p className="mt-2 text-sm text-white/70">
            By using Lokhari you agree to these terms. Please read them carefully before accessing the platform.
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
              <strong>Agreement:</strong> These Terms constitute a legally binding agreement between you and {COMPANY} governing your use of the Lokhari platform. Continued use of the platform indicates acceptance of any updates.
            </div>

            <Section id="eligibility" title="1. Eligibility">
              <p>To use Lokhari you must:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Be at least 18 years of age.</li>
                <li>Be legally capable of entering into binding contracts under Indian law.</li>
                <li>Be a resident or registered entity within India (or as otherwise permitted by us).</li>
                <li>Not be barred from receiving services under applicable law.</li>
              </ul>
              <p>By registering, you represent and warrant that you meet all eligibility requirements.</p>
            </Section>

            <Section id="account" title="2. Account Registration">
              <p>You must provide accurate, current, and complete information during registration. You are responsible for:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Maintaining the confidentiality of your login credentials.</li>
                <li>All activities that occur under your account.</li>
                <li>Immediately notifying us of any unauthorised access or security breach.</li>
                <li>Keeping your contact information up to date.</li>
              </ul>
              <p>One natural person or legal entity may hold only one account. Creating multiple accounts to circumvent restrictions is prohibited and grounds for immediate termination.</p>
            </Section>

            <Section id="listings" title="3. Listings & Transactions">
              <p><strong className="text-gray-800">Accuracy:</strong> All listings must accurately describe the commodity, quantity, quality grade, and location. Misrepresentation is grounds for suspension.</p>
              <p><strong className="text-gray-800">Binding Bids:</strong> A bid accepted by the seller creates a binding contract between buyer and seller. Lokhari facilitates but is not a party to such contracts.</p>
              <p><strong className="text-gray-800">Responsibility:</strong> Sellers are responsible for the quality and delivery of goods as described. Buyers are responsible for timely payment and collection.</p>
              <p><strong className="text-gray-800">Platform Fee:</strong> Lokhari charges a transaction fee on completed sales as disclosed on the platform's pricing page. Fees are non-refundable once a transaction is completed.</p>
              <p><strong className="text-gray-800">Cancellations:</strong> Cancellation policies are set per listing. Repeated cancellations may result in account restrictions.</p>
            </Section>

            <Section id="payments" title="4. Payments & Escrow">
              <p>Payments are processed through our integrated payment gateway. Funds are held in escrow until:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>The buyer confirms receipt and quality acceptance of the goods; or</li>
                <li>The dispute resolution period (72 hours after delivery) elapses without a dispute.</li>
              </ul>
              <p>Lokhari is not a bank or payment service provider. Escrow services are provided through licensed third-party partners. In the event of fraud or dispute, funds may be held pending investigation.</p>
            </Section>

            <Section id="conduct" title="5. Prohibited Conduct">
              <p>You agree not to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Post false, misleading, or fraudulent listings.</li>
                <li>Manipulate prices through collusion or artificial bidding.</li>
                <li>Harass, threaten, or abuse other users.</li>
                <li>Use the platform to launder money or finance illegal activities.</li>
                <li>Scrape, reverse-engineer, or attempt to extract our data or algorithms.</li>
                <li>Circumvent any security, authentication, or access control measures.</li>
                <li>Violate any applicable export controls, sanctions, or trade laws.</li>
                <li>Conduct transactions outside the platform to avoid fees ("fee avoidance").</li>
              </ul>
              <p>Violation of any of the above may result in immediate account suspension, legal action, and reporting to relevant authorities.</p>
            </Section>

            <Section id="kyc" title="6. KYC & Verification">
              <p>Lokhari conducts Know Your Customer (KYC) verification in compliance with applicable Indian regulations. You agree to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Submit accurate identity documents when requested.</li>
                <li>Allow us to verify documents with relevant authorities.</li>
                <li>Update your KYC information promptly if circumstances change.</li>
              </ul>
              <p>Failure to complete or maintain KYC verification may result in restricted access to certain platform features.</p>
            </Section>

            <Section id="ip" title="7. Intellectual Property">
              <p>{COMPANY} owns all intellectual property rights in the Lokhari platform, including its design, algorithms, trademarks, and content. You are granted a limited, non-exclusive, non-transferable licence to access and use the platform for its intended purposes.</p>
              <p>You retain ownership of content you post (listings, photos, descriptions). By posting, you grant Lokhari a worldwide, royalty-free licence to display and use such content to operate the platform.</p>
              <p>You may not copy, reproduce, distribute, or create derivative works of Lokhari content without express written permission.</p>
            </Section>

            <Section id="liability" title="8. Limitation of Liability">
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Lokhari provides the platform "as is" without warranties of any kind.</li>
                <li>We are not liable for the quality, safety, legality, or delivery of goods transacted through the platform.</li>
                <li>Our total liability for any claim shall not exceed the fees paid by you to Lokhari in the 3 months preceding the incident.</li>
                <li>We are not liable for indirect, consequential, or punitive damages.</li>
              </ul>
              <p>Nothing in these terms excludes liability for fraud, wilful misconduct, death, or personal injury caused by our negligence.</p>
            </Section>

            <Section id="dispute" title="9. Dispute Resolution">
              <p><strong className="text-gray-800">Between Users:</strong> Disputes between buyers and sellers must first be raised through Lokhari's in-platform dispute resolution system within 72 hours of delivery. Lokhari's decision is final for disputes within the escrow period.</p>
              <p><strong className="text-gray-800">Against Lokhari:</strong> Any claim against {COMPANY} must first be submitted in writing to <a href={`mailto:${EMAIL}`} className="font-medium text-[#2eb5c2] hover:underline">{EMAIL}</a>. If unresolved within 30 days, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Bangalore, India.</p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p>You may close your account at any time through the platform settings. We may suspend or terminate your account, with or without notice, if:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>You breach any of these Terms.</li>
                <li>We are required to do so by law or regulatory authority.</li>
                <li>Your account shows signs of fraud or security risk.</li>
                <li>You have not accessed the platform for 24 consecutive months.</li>
              </ul>
              <p>Upon termination, your right to use the platform ceases immediately. Sections on intellectual property, liability, and dispute resolution survive termination.</p>
            </Section>

            <Section id="governing" title="11. Governing Law">
              <p>These Terms are governed by and construed in accordance with the laws of India. Subject to the arbitration clause above, you irrevocably submit to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>
            </Section>

            <Section id="contact" title="12. Contact">
              <p>For legal notices and queries regarding these Terms:</p>
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
              <Link href="/privacy-policy" className="flex items-center gap-1.5 text-sm font-medium text-[#2eb5c2] hover:underline">
                <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
                Privacy Policy
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
