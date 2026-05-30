// Shared formatting + small pure helpers used across pages and components.

const EURO_LOCALES = { de: 'de-DE', en: 'en-IE', tr: 'tr-TR' };

export function formatEuro(price, lang = 'de', onRequest = 'Preis auf Anfrage') {
  const value = Number(price);
  if (!Number.isFinite(value)) return onRequest;
  return new Intl.NumberFormat(EURO_LOCALES[lang] || 'de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

const SPIN_DATE_LOCALES = { de: 'de-DE', en: 'en-GB', tr: 'tr-TR' };

export function formatSpinDate(iso, lang = 'de') {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(SPIN_DATE_LOCALES[lang] || 'de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date);
}

export function getFirstName(profile) {
  if (profile?.firstName) return profile.firstName;
  if (profile?.fullName) return profile.fullName.trim().split(/\s+/)[0] || '';
  return '';
}

// Maps a Firebase auth error to a localized message from the i18n dictionary.
export function getAuthErrorMessage(error, t) {
  const e = t.account.authError;
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return e.emailInUse;
    case 'auth/invalid-email':
      return e.invalidEmail;
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return e.invalidCredential;
    case 'auth/weak-password':
      return e.weakPassword;
    default:
      return e.generic;
  }
}
