const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

export function isEmptyOrSpaces(str) {
  if (str == null) return true;
  if (typeof str !== 'string') return true;
  return str.trim() === '';
}
