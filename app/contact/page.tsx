'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import RegistrationFormField, {
  registrationInputClass,
} from '@/components/forms/RegistrationFormField';
import ReCaptchaField from '@/components/common/ReCaptchaField';
import { useRecaptchaForm } from '@/hooks/useRecaptchaForm';
import { submitContactInquiry } from '@/lib/contact';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const recaptcha = useRecaptchaForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recaptcha.validate()) return;

    setIsSubmitting(true);

    try {
      await submitContactInquiry({
        ...formData,
        recaptchaToken: recaptcha.token,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      recaptcha.reset();
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
      recaptcha.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    {
      icon: 'mail',
      title: 'Email',
      value: 'support@lokhari.com',
      href: 'mailto:support@lokhari.com',
    },
    {
      icon: 'call',
      title: 'Phone',
      value: '+91 1800-123-4567',
      href: 'tel:+9118001234567',
    },
    {
      icon: 'location_on',
      title: 'Office',
      value: 'Pune, Maharashtra, India',
    },
    {
      icon: 'schedule',
      title: 'Support hours',
      value: 'Mon–Sat, 9:00 AM – 6:00 PM IST',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#0b5d68] mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question about the marketplace, partnerships, or your account? Our team is here to
            help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {contactDetails.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2eb5c2]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0b5d68]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {item.title}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-[#0b5d68] hover:text-[#2eb5c2] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[#0b5d68]">{item.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-xl p-6 text-white">
              <h2 className="font-headline text-lg font-bold mb-2">Need quick answers?</h2>
              <p className="text-sm text-white/90 mb-4">
                Browse the marketplace or read about our mission while you wait for a reply.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/listings"
                  className="text-sm font-medium text-white underline underline-offset-2 hover:text-white/90"
                >
                  Visit Marketplace
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-white underline underline-offset-2 hover:text-white/90"
                >
                  About Lokhari
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-green-600">
                    check_circle
                  </span>
                </div>
                <h2 className="font-headline text-xl font-bold text-[#0b5d68] mb-2">
                  Message sent
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
                </p>
                <Button variant="primary" size="md" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-headline text-xl font-bold text-[#0b5d68] mb-1">
                  Send us a message
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Fill in the form and we&apos;ll respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <RegistrationFormField label="Full Name" icon="person">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={registrationInputClass()}
                        placeholder="Your name"
                        required
                      />
                    </RegistrationFormField>

                    <RegistrationFormField label="Email" icon="email">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={registrationInputClass()}
                        placeholder="you@example.com"
                        required
                      />
                    </RegistrationFormField>
                  </div>

                  <RegistrationFormField label="Subject" icon="subject">
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={registrationInputClass()}
                      placeholder="How can we help?"
                      required
                    />
                  </RegistrationFormField>

                  <div className="space-y-1.5">
                    <label className="block font-medium text-[#0b5d68] text-[0.875rem]">Message</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-0 top-0 flex items-start pl-3 pt-3">
                        <span className="material-symbols-outlined text-base text-[#2eb5c2]">edit_note</span>
                      </div>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className={`${registrationInputClass()} resize-y min-h-[120px]`}
                        placeholder="Tell us more about your inquiry..."
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <span className="material-symbols-outlined text-base shrink-0">error</span>
                      {error}
                    </div>
                  )}

                  <ReCaptchaField
                    resetKey={recaptcha.resetKey}
                    onChange={recaptcha.setToken}
                    error={recaptcha.error}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
