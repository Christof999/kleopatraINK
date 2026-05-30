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
import { useI18n } from '../i18n';
import { getAuthErrorMessage, getFirstName, formatSpinDate } from '../lib/format';
import { auth, db, firebaseConfigured } from '../firebase';

export default function Account({ onBack, onOpenWheel, wheelEligible = false, wheelConfigReady = false, wheelHistory = [] }) {
  const { t, lang } = useI18n();
  const a = t.account;
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
      setNotice({ type: 'success', text: a.notice.loggedIn });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error, t) });
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
      setNotice({ type: 'success', text: a.notice.accountCreated });
      if (onOpenWheel) {
        setTimeout(() => onOpenWheel(), 700);
      }
    } catch (error) {
      const isLoggedInAfterRegister = auth.currentUser?.email?.toLowerCase() === email;
      setNotice({
        type: isLoggedInAfterRegister ? 'warning' : 'error',
        text: isLoggedInAfterRegister
          ? a.notice.registerNoProfile
          : getAuthErrorMessage(error, t),
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
      setNotice({ type: 'success', text: a.notice.profileSaved });
    } catch (error) {
      console.error('[Account] User profile save failed:', error);
      setNotice({ type: 'error', text: a.notice.profileSaveFailed });
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
      setNotice({ type: 'success', text: a.notice.loggedOut });
    } catch {
      setNotice({ type: 'error', text: a.notice.logoutFailed });
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = getFirstName(profile) || user?.displayName || '';
  const lastName = profile?.lastName || '';
  const phone = profile?.phone || '';
  const email = profile?.email || user?.email || '';
  const displayName = firstName || a.defaultName;

  return (
    <div className="page with-bg">
      <PageHead
        kicker={a.kicker}
        title={a.title} titleEm={a.titleEm}
        meta={<>
          <b>{user ? a.metaLoggedIn : a.metaLogin}</b>
          <div>{a.metaAuth}</div>
          <div>{a.metaProfile}</div>
        </>}
        onBack={onBack}
      />

      {!firebaseConfigured ? (
        <p className="gal-empty">{a.notConfigured}</p>
      ) : authLoading ? (
        <div className="fb-loading"><div className="ig-spinner" /></div>
      ) : user ? (
        <div className="account-layout">
          <section className="account-panel">
            <div className="account-kicker">{a.loggedInAs}</div>
            <h2 className="account-title">{profileLoading && !firstName ? a.profileLoading : displayName}</h2>
            <p className="account-copy">{a.profileIntro}</p>
            {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
            <form className="account-form account-profile-form" onSubmit={handleProfileSave}>
              <div className="account-form-grid">
                <div className="field">
                  <label>{a.firstName}</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    required
                    value={profileForm.firstName}
                    onChange={(event) => updateProfileForm('firstName', event.target.value)}
                    placeholder={a.firstName}
                  />
                </div>
                <div className="field">
                  <label>{a.lastName}</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    required
                    value={profileForm.lastName}
                    onChange={(event) => updateProfileForm('lastName', event.target.value)}
                    placeholder={a.lastName}
                  />
                </div>
              </div>
              <div className="field">
                <label>{a.phone}</label>
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
                <label>{a.emailInProfile}</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={profileForm.email}
                  onChange={(event) => updateProfileForm('email', event.target.value)}
                  placeholder={t.booking.phEmail}
                />
              </div>
              <div className="account-actions">
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? t.common.pleaseWait : a.saveProfile}
                </button>
                <button className="account-secondary-btn" type="button" onClick={handleLogout} disabled={submitting}>
                  {a.logout}
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
                  {wheelConfigReady ? a.wheelExclusive : a.wheelSoon}
                </span>
                <span className="account-gluecksrad-cta-title">
                  {wheelConfigReady ? a.wheelOpen : a.wheelPreparing}
                </span>
                <span className="account-gluecksrad-cta-sub">
                  {wheelConfigReady ? a.wheelOpenSub : a.wheelPendingSub}
                </span>
              </button>
            )}

            {wheelHistory.length > 0 && (
              <div className="account-vouchers">
                <div className="account-vouchers-head">
                  <span className="account-vouchers-kicker">{a.yourWins}</span>
                  <span className="account-vouchers-count">{wheelHistory.length} {wheelHistory.length === 1 ? a.entry : a.entries}</span>
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
                          {a.spunOn(formatSpinDate(entry.spunAt, lang))}
                        </div>
                      </div>
                      <div className="account-voucher-state">
                        {entry.redeemed ? (
                          <>
                            <span className="account-voucher-state-dot" aria-hidden="true" />
                            <span>{a.redeemed(entry.redeemedAt ? formatSpinDate(entry.redeemedAt, lang) : '')}</span>
                          </>
                        ) : (
                          <>
                            <span className="account-voucher-state-dot open" aria-hidden="true" />
                            <span>{a.stillOpen}</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="account-vouchers-hint">{a.winsHint}</p>
              </div>
            )}
          </section>

          <aside className="summary">
            <h4>{a.summaryProfile}</h4>
            <div className="sum-row"><span className="sum-k">{a.email}</span><span className="sum-v account-email-value">{email}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryFirstName}</span><span className={`sum-v ${firstName ? '' : 'empty'}`}>{firstName || a.notSet}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryLastName}</span><span className={`sum-v ${lastName ? '' : 'empty'}`}>{lastName || a.notSet}</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryPhone}</span><span className={`sum-v ${phone ? '' : 'empty'}`}>{phone || a.notSet}</span></div>
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
                {a.tabLogin}
              </button>
              <button
                className={`gal-chip ${mode === 'register' ? 'active' : ''}`}
                type="button"
                onClick={() => { setMode('register'); setNotice(null); }}
              >
                {a.tabRegister}
              </button>
            </div>

            {mode === 'login' ? (
              <form className="account-form" onSubmit={handleLogin}>
                <div className="field">
                  <label>{a.email}</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(event) => updateLoginForm('email', event.target.value)}
                    placeholder={t.booking.phEmail}
                  />
                </div>
                <div className="field">
                  <label>{a.password}</label>
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
                  {submitting ? t.common.pleaseWait : a.login}
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleRegister}>
                <div className="account-form-grid">
                  <div className="field">
                    <label>{a.firstName}</label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      required
                      value={registerForm.firstName}
                      onChange={(event) => updateRegisterForm('firstName', event.target.value)}
                      placeholder={a.phFirstName}
                    />
                  </div>
                  <div className="field">
                    <label>{a.lastName}</label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      required
                      value={registerForm.lastName}
                      onChange={(event) => updateRegisterForm('lastName', event.target.value)}
                      placeholder={a.phLastName}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>{a.phone}</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={registerForm.phone}
                    onChange={(event) => updateRegisterForm('phone', event.target.value)}
                    placeholder={a.phPhoneReg}
                  />
                </div>
                <div className="field">
                  <label>{a.email}</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(event) => updateRegisterForm('email', event.target.value)}
                    placeholder={t.booking.phEmail}
                  />
                </div>
                <div className="field">
                  <label>{a.password}</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(event) => updateRegisterForm('password', event.target.value)}
                    placeholder={a.phPassword}
                  />
                </div>
                {notice && <div className={`account-notice ${notice.type}`}>{notice.text}</div>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? t.common.pleaseWait : a.createAccount}
                </button>
              </form>
            )}
          </section>

          <aside className="summary">
            <h4>{a.hint}</h4>
            <div className="sum-row"><span className="sum-k">Auth</span><span className="sum-v">Firebase</span></div>
            <div className="sum-row"><span className="sum-k">{a.summaryProfile}</span><span className="sum-v">users/uid</span></div>
            <div className="sum-row"><span className="sum-k">{a.password}</span><span className="sum-v">Firestore ✗</span></div>
          </aside>
        </div>
      )}
    </div>
  );
}
