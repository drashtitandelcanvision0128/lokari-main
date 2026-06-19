export const RECAPTCHA_REQUIRED_MSG = 'Please verify that you are not a robot.';

export function isRecaptchaConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim());
}

export function getRecaptchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || '';
}
