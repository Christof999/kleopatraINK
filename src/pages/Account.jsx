import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import PageHead from '../components/PageHead';
import { formatSegment } from '../components/LuckyWheel';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage, getFirstName, formatSpinDate } from '../lib/format';
import { auth, db, firebaseConfigured } from '../firebase';

export default function Account({ onBack, onOpenWheel, wheelEligible = false, wheelConfigReady = false, wheelHistory = [] }) {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState('login');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (!active) return;
        if (snap.exists()) {
          const firestoreProfile = { uid: user.uid, ...snap.data() };
          setProfile(firestoreProfile);
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        console.warn('[Account] User profile fetch failed:', err);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const updateLoginForm = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const updateProfileForm = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!user) {
      setProfileForm({ firstName: '', lastName: '', phone: '', email: '' });
      return;
    }

    setProfileForm({
      firstName: getFirstName(profile) || user.displayName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      email: profile?.email || user.email || '',
    });
  }, [profile, user]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!auth) return;

    setSubmitting(true);
    setNotice(null);

    try {
      await signInWithEmailAndPassword(
        auth,
        loginForm.email.trim().toLowerCase(),
        loginForm.password
      );
      setLoginForm({ email: '', password: '' });
      setNotice({ type: 'success', text: 'Du bist eingeloggt.' });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!auth || !db) return;

    const firstName = registerForm.firstName.trim();
    const lastName = registerForm.lastName.trim();
    const phone = registerForm.phone.trim();
    const email = registerForm.email.trim().toLowerCase();

    setSubmitting(true);
    setNotice(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, registerForm.password);
      await updateProfile(credential.user, { displayName: firstName }).catch((err) => {
        console.warn('[Account] Auth display name update failed:', err);
      });

      const displayProfile = {
        uid: credential.user.uid,
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone,
      };

      const profileData = {
        ...displayProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', credential.user.uid), profileData, { merge: true });
      setProfile(displayProfile);
      setRegisterForm({ firstName: '', lastName: '', phone: '', email: '', password: '' });
      setNotice({ type: 'success', text: 'Dein Kunden-Account wurde erstellt. Gleich öffnet sich dein Glücksrad …' });
      if (onOpenWheel) {
        setTimeout(() => onOpenWheel(), 700);
      }
    } catch (error) {
      const isLoggedInAfterRegister = auth.currentUser?.email?.toLowerCase() === email;
      setNotice({
        type: isLoggedInAfterRegister ? 'warning' : 'error',
        text: isLoggedInAfterRegister
          ? 'Dein Account wurde erstellt, aber das Profil konnte nicht in Firestore gespeichert werden.'
          : getAuthErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!auth?.currentUser || !db) return;

    const firstNameValue = profileForm.firstName.trim();
    const lastNameValue = profileForm.lastName.trim();
    const phoneValue = profileForm.phone.trim();
    const emailValue = profileForm.email.trim().toLowerCase();

    setSubmitting(true);
    setNotice(null);

    try {
      await updateProfile(auth.currentUser, { displayName: firstNameValue }).catch((err) => {
        console.warn('[Account] Auth display name update failed:', err);
      });

      const profileData = {
        uid: auth.currentUser.uid,
        email: emailValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        fullName: `${firstNameValue} ${lastNameValue}`,
        phone: phoneValue,
        updatedAt: serverTimestamp(),
      };

      if (!profile) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData, { merge: true });

      const displayProfile = {
        uid: auth.currentUser.uid,
        email: emailValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        fullName: `${firstNameValue} ${lastNameValue}`,
        phone: phoneValue,
      };

      setProfile(displayProfile);
      setNotice({ type: 'success', text: 'Dein Profil wurde gespeichert.' });
    } catch (error) {
      console.error('[Account] User profile save failed:', error);
      setNotice({ type: 'error', text: 'Dein Profil konnte nicht gespeichert werden.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;

    setSubmitting(true);
    setNotice(null);

    try {
      await signOut(auth);
      setProfile(null);
      setMode('login');
      setNotice({ type: 'success', text: 'Du bist ausgeloggt.' });
    } catch {
      setNotice({ type: 'error', text: 'Logout konnte nicht ausgeführt werden.' });
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = getFirstName(profile) || user?.displayName || '';
  const lastName = profile?.lastName || '';
  const phone = profile?.phone || '';
  const email = profile?.email || user?.email || '';
  const displayName = firstName || 'Dein Account';

  return (
    <div className="page with-bg">
      <PageHead
        kicker="Kundenbereich · Kleopatra INK"
        title="Dein" titleEm="Account"
        meta={<>
          <b>{user ? 'Eingeloggt' : 'Login'}</b>
          <div>Firebase Auth</div>
          <div>Kundenprofil</div>
        </>}
        onBack={onBack}
      />

      {!firebaseConfigured ? (
        <p className="gal-empty">Firebase ist für diese Umgebung nicht konfiguriert.</p>
      ) : authLoading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : user ? (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-kicker">Angemeldet als</div>
            <h2 className="account-title">{profileLoading && !firstName ? 'Profil wird geladen …' : displayName}</h2>
            <p className="account-copy">
              Ergänze hier deine Kontaktdaten. Nach dem Speichern stehen sie auch im Admin-Portal zur Verfügung.
            </p>
            {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
            <form className="account-form account-profile-form" onSubmit={handleProfileSave}>
              <div className="account-form-grid">
                <div className="field">
                  <label>Vorname</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    required
                    value={profileForm.firstName}
                    onChange={(event) => updateProfileForm('firstName', event.target.value)}
                    placeholder="Vorname"
                  />
                </div>
                <div className="field">
                  <label>Nachname</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    required
                    value={profileForm.lastName}
                    onChange={(event) => updateProfileForm('lastName', event.target.value)}
                    placeholder="Nachname"
                  />
                </div>
              </div>
              <div className="field">
                <label>Telefonnummer</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={profileForm.phone}
                  onChange={(event) => updateProfileForm('phone', event.target.value)}
                  placeholder="+49 …"
                />
              </div>
              <div className="field">
                <label>E-Mail im Profil</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={profileForm.email}
                  onChange={(event) => updateProfileForm('email', event.target.value)}
                  placeholder="deine@email.de"
                />
              </div>
              <div className="account-actions">
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Profil speichern'}
                </button>
                <button className="account-secondary-btn" type="button" onClick={handleLogout} disabled={submitting}>
                  Logout
                </button>
              </div>
            </form>

            {wheelEligible && (
              <button
                type="button"
                className={`account-gluecksrad-cta${wheelConfigReady ? '' : ' is-pending'}`}
                onClick={() => { if (wheelConfigReady && onOpenWheel) onOpenWheel(); }}
                disabled={!wheelConfigReady}
              >
                <span className="account-gluecksrad-cta-kicker">
                  {wheelConfigReady ? 'Exklusiv für Kunden' : 'Bald verfügbar'}
                </span>
                <span className="account-gluecksrad-cta-title">
                  {wheelConfigReady ? 'Glücksrad öffnen →' : 'Glücksrad wird vorbereitet'}
                </span>
                <span className="account-gluecksrad-cta-sub">
                  {wheelConfigReady
                    ? 'Du hast einen Dreh frei — Gewinn im Studio einlösen.'
                    : 'Du bist für einen Dreh freigeschaltet. Das Rad ist gerade nicht aktiv — sobald es vom Studio aktiviert wird, kannst du hier drehen.'}
                </span>
              </button>
            )}

            {wheelHistory.length > 0 && (
              <div className="account-vouchers">
                <div className="account-vouchers-head">
                  <span className="account-vouchers-kicker">Deine Gewinne</span>
                  <span className="account-vouchers-count">{wheelHistory.length} {wheelHistory.length === 1 ? 'Eintrag' : 'Einträge'}</span>
                </div>
                <ul className="account-vouchers-list">
                  {[...wheelHistory].reverse().map((entry) => (
                    <li key={entry.id} className={`account-voucher ${entry.redeemed ? 'is-redeemed' : 'is-open'}`}>
                      <div className="account-voucher-main">
                        <div className="account-voucher-value">{formatSegment(entry)}</div>
                        {entry.label && entry.type !== 'text' && (
                          <div className="account-voucher-label">{entry.label}</div>
                        )}
                        <div className="account-voucher-date">
                          Gedreht am {formatSpinDate(entry.spunAt)}
                        </div>
                      </div>
                      <div className="account-voucher-state">
                        {entry.redeemed ? (
                          <>
                            <span className="account-voucher-state-dot" aria-hidden="true" />
                            <span>Eingelöst{entry.redeemedAt ? ` · ${formatSpinDate(entry.redeemedAt)}` : ''}</span>
                          </>
                        ) : (
                          <>
                            <span className="account-voucher-state-dot open" aria-hidden="true" />
                            <span>Noch offen — im Studio einlösen</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="account-vouchers-hint">
                  Zeig deinen Eintrag beim nächsten Studio-Besuch — wir lösen ihn dann für dich ein.
                </p>
              </div>
            )}
          </section>

          <aside className="summary">
            <h4>Profil</h4>
            <div className="sum-row"><span className="sum-k">E-Mail</span><span className="sum-v account-email-value">{email}</span></div>
            <div className="sum-row"><span className="sum-k">Vorname</span><span className={`sum-v ${firstName ? '' : 'empty'}`}>{firstName || 'nicht gesetzt'}</span></div>
            <div className="sum-row"><span className="sum-k">Nachname</span><span className={`sum-v ${lastName ? '' : 'empty'}`}>{lastName || 'nicht gesetzt'}</span></div>
            <div className="sum-row"><span className="sum-k">Telefon</span><span className={`sum-v ${phone ? '' : 'empty'}`}>{phone || 'nicht gesetzt'}</span></div>
          </aside>
        </div>
      ) : (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-tabs" role="tablist" aria-label="Account Formular">
              <button
                className={`gal-chip ${mode === 'login' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('login'); setNotice(null); }}
              >
                Login
              </button>
              <button
                className={`gal-chip ${mode === 'register' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('register'); setNotice(null); }}
              >
                Registrierung
              </button>
            </div>

            {mode === 'login' ? (
              <form className="account-form" onSubmit={handleLogin}>
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(event) => updateLoginForm('email', event.target.value)}
                    placeholder="deine@email.de"
                  />
                </div>
                <div className="field">
                  <label>Passwort</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(event) => updateLoginForm('password', event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Einloggen'}
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleRegister}>
                <div className="account-form-grid">
                  <div className="field">
                    <label>Vorname</label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      required
                      value={registerForm.firstName}
                      onChange={(event) => updateRegisterForm('firstName', event.target.value)}
                      placeholder="Max"
                    />
                  </div>
                  <div className="field">
                    <label>Nachname</label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      required
                      value={registerForm.lastName}
                      onChange={(event) => updateRegisterForm('lastName', event.target.value)}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Telefonnummer</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={registerForm.phone}
                    onChange={(event) => updateRegisterForm('phone', event.target.value)}
                    placeholder="+49 170 1234567"
                  />
                </div>
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(event) => updateRegisterForm('email', event.target.value)}
                    placeholder="deine@email.de"
                  />
                </div>
                <div className="field">
                  <label>Passwort</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(event) => updateRegisterForm('password', event.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? 'Bitte warten …' : 'Account erstellen'}
                </button>
              </form>
            )}
          </section>

          <aside className="summary">
            <h4>Hinweis</h4>
            <div className="sum-row"><span className="sum-k">Auth</span><span className="sum-v">Firebase</span></div>
            <div className="sum-row"><span className="sum-k">Profil</span><span className="sum-v">users/uid</span></div>
            <div className="sum-row"><span className="sum-k">Passwort</span><span className="sum-v">nicht in Firestore</span></div>
          </aside>
        </div>
      )}
    </div>
  );
}
