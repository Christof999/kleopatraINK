// Shared formatting + small pure helpers used across pages and components.

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export function formatEuro(price) {
  const value = Number(price);
  return Number.isFinite(value) ? EUR_FORMATTER.format(value) : 'Preis auf Anfrage';
}

const SPIN_DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function formatSpinDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return SPIN_DATE_FORMATTER.format(date);
}

export function getFirstName(profile) {
  if (profile?.firstName) return profile.firstName;
  if (profile?.fullName) return profile.fullName.trim().split(/\s+/)[0] || '';
  return '';
}

export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse ist bereits registriert.';
    case 'auth/invalid-email':
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-Mail oder Passwort ist nicht korrekt.';
    case 'auth/weak-password':
      return 'Bitte wähle ein stärkeres Passwort mit mindestens 6 Zeichen.';
    default:
      return 'Die Anmeldung ist gerade nicht möglich. Bitte versuche es erneut.';
  }
}
