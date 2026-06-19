import { apiUrl } from '@/lib/api';

export interface ContactInquiryPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken?: string | null;
}

interface ContactApiResponse {
  status?: string;
  error?: string;
  message?: string;
  data?: {
    inquiryId?: string;
    submittedAt?: string;
  };
}

/** POST /contact — submit a contact form inquiry */
export async function submitContactInquiry(
  payload: ContactInquiryPayload,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(apiUrl('/contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        ...(payload.recaptchaToken ? { recaptchaToken: payload.recaptchaToken } : {}),
      }),
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl('/contact')}. Is the backend running?`,
    );
  }

  let body: ContactApiResponse = {};
  try {
    body = await response.json();
  } catch {
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'Failed to send your message');
  }

  return body.message || 'Your message has been sent.';
}
