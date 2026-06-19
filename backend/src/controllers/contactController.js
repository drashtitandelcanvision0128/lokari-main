import { submitContactInquiry } from '../services/contactService.js';

export async function createContactInquiryHandler(req, res) {
  try {
    const inquiry = await submitContactInquiry(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Your message has been sent. We will get back to you soon.',
      data: {
        inquiryId: inquiry.inquiry_id,
        submittedAt: inquiry.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to submit your message. Please try again.',
    });
  }
}
