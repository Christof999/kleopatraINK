import { useEffect, useRef, useState } from 'react';
import { arrayUnion, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import CookieBanner from './components/CookieBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { WheelInviteModal, WheelModal } from './components/WheelModals';
import { Imprint, Privacy, SiteFooter } from './components/Legal';
import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio } from './components/TweaksPanel';

import Landing from './pages/Landing';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Booking from './pages/Booking';
import PiercingPrices from './pages/PiercingPrices';
import Testimonials from './pages/Testimonials';
import Socials from './pages/Socials';
import Account from './pages/Account';
import WannaDos from './pages/WannaDos';

import { useAuth } from './context/AuthContext';
import { getFirstName } from './lib/format';
import { PAGE_TITLES } from './data/navigation';
import { db } from './firebase';
import './styles.css';

const TWEAK_DEFAULTS = {
  gold: 70,
  bgMode: 'particles',
  headStyle: 'classic',
};

function getInviteStorageKey(uid, opportunityIndex) {
  return `kleopatra:wheelInvite:${uid}:${opportunityIndex}`;
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedWannado, setSelectedWannado] = useState(null);
  const [selectedPiercing, setSelectedPiercing] = useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const mainRef = useRef(null);

  const { user } = useAuth();
  const [wheelConfig, setWheelConfig] = useState(null);
  const [wheelConfigLoaded, setWheelConfigLoaded] = useState(!db);
  const [wheelUserData, setWheelUserData] = useState(null);
  const [wheelUserLoaded, setWheelUserLoaded] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSaving, setWheelSaving] = useState(false);
  const [wheelSaveError, setWheelSaveError] = useState(null);
  const [wheelJustWon, setWheelJustWon] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = PAGE_TITLES[page] || PAGE_TITLES.home;
  }, [page]);

  useEffect(() => {
    if (!db) {
      setWheelConfigLoaded(true);
      return undefined;
    }
    return onSnapshot(
      doc(db, 'wheelConfig', 'main'),
      (snap) => {
        setWheelConfig(snap.exists() ? snap.data() : null);
        setWheelConfigLoaded(true);
      },
      (err) => {
        console.warn('[App] wheelConfig snapshot failed:', err);
        setWheelConfigLoaded(true);
      },
    );
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setWheelUserData(null);
      setWheelUserLoaded(!user);
      return undefined;
    }
    setWheelUserLoaded(false);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setWheelUserData(snap.exists() ? snap.data() : null);
        setWheelUserLoaded(true);
      },
      (err) => {
        console.warn('[App] user snapshot failed:', err);
        setWheelUserLoaded(true);
      },
    );
  }, [user]);

  const wheelHistory = Array.isArray(wheelUserData?.wheelSpinHistory)
    ? wheelUserData.wheelSpinHistory
    : [];
  const wheelEligible =
    !!user && wheelUserLoaded && wheelUserData?.wheelSpinAvailable !== false;
  const wheelConfigReady =
    wheelConfigLoaded
    && !!wheelConfig
    && wheelConfig.active !== false
    && Array.isArray(wheelConfig.segments)
    && wheelConfig.segments.length > 0;
  const canSpin = wheelEligible && wheelConfigReady;

  useEffect(() => {
    if (!user) {
      setInviteOpen(false);
      setWheelOpen(false);
      setWheelJustWon(null);
      setWheelSaveError(null);
      return;
    }
    if (!canSpin) return;
    if (wheelOpen || inviteOpen) return;

    const storageKey = getInviteStorageKey(user.uid, wheelHistory.length);
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(storageKey) === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return;

    setInviteOpen(true);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore — sessionStorage might be blocked
    }
  }, [user, canSpin, wheelOpen, inviteOpen, wheelHistory.length]);

  const openWheelModal = () => {
    setInviteOpen(false);
    setWheelSaveError(null);
    setWheelJustWon(null);
    setWheelOpen(true);
  };

  const closeWheelModal = () => {
    setWheelOpen(false);
    setWheelJustWon(null);
    setWheelSaveError(null);
  };

  const handleSpinResult = async (segment) => {
    if (wheelSaving || !user || !db) return;
    if (wheelUserData?.wheelSpinAvailable === false) return;

    setWheelSaving(true);
    setWheelSaveError(null);

    const rand = Math.random().toString(36).slice(2, 8);
    const entry = {
      id: `spin_${Date.now()}_${rand}`,
      spunAt: new Date().toISOString(),
      segmentId: segment.id,
      label: segment.label || '',
      type: segment.type || 'text',
      ...(segment.value !== undefined && segment.value !== null
        ? { value: Number(segment.value) }
        : {}),
      redeemed: false,
      redeemedAt: null,
    };

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          wheelSpinHistory: arrayUnion(entry),
          wheelSpinAvailable: false,
          wheelUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setWheelJustWon(entry);
    } catch (err) {
      console.error('[App] Spin write failed:', err);
      setWheelSaveError('Dein Gewinn konnte nicht gespeichert werden. Bitte zeig den Bildschirm im Studio.');
    } finally {
      setWheelSaving(false);
    }
  };

  const inviteFirstName = getFirstName(wheelUserData) || user?.displayName || '';

  const onBack = () => { setPage('home'); setSelectedWannado(null); setSelectedPiercing(null); };

  const onBookWannado = (item) => {
    setSelectedWannado(item);
    setSelectedPiercing(null);
    setPage('booking');
  };

  const onBookPiercing = (item) => {
    setSelectedPiercing(item);
    setSelectedWannado(null);
    setPage('booking');
  };

  const goTo = (target) => {
    setPage(target);
    if (target !== 'booking') {
      setSelectedWannado(null);
      setSelectedPiercing(null);
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Zum Inhalt springen</a>

      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <ErrorBoundary
          key={page}
          fallback={
            <div className="page with-bg" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
              <div style={{ maxWidth: 480, textAlign: 'center', padding: 20 }}>
                <div className="page-kicker">Etwas ist schiefgelaufen</div>
                <h1 className="page-title" style={{ marginBottom: 24 }}>Ups.</h1>
                <p className="cormorant" style={{ fontSize: 18, color: 'var(--ivory)', opacity: 0.9 }}>
                  Dieser Bereich konnte nicht geladen werden. Bitte versuch es erneut.
                </p>
                <button className="page-back" style={{ marginTop: 28 }} onClick={onBack}>← Zurück zur Startseite</button>
              </div>
            </div>
          }
        >
          {page === 'home'         && <Landing onNav={goTo} tweaks={t} />}
          {page === 'gallery'      && <Gallery onBack={onBack} />}
          {page === 'about'        && <About onBack={onBack} />}
          {page === 'booking'      && <Booking onBack={onBack} wannado={selectedWannado} piercing={selectedPiercing} />}
          {page === 'piercing'     && <PiercingPrices onBack={onBack} onBook={onBookPiercing} />}
          {page === 'testimonials' && <Testimonials onBack={onBack} />}
          {page === 'socials'      && <Socials onBack={onBack} />}
          {page === 'account'      && (
            <Account
              onBack={onBack}
              onOpenWheel={wheelEligible ? openWheelModal : null}
              wheelEligible={wheelEligible}
              wheelConfigReady={wheelConfigReady}
              wheelHistory={wheelHistory}
            />
          )}
          {page === 'wannados'     && <WannaDos onBack={onBack} onBook={onBookWannado} />}
          {page === 'imprint'      && <Imprint onBack={onBack} />}
          {page === 'privacy'      && <Privacy onBack={onBack} />}
        </ErrorBoundary>
      </main>

      <SiteFooter onNav={goTo} />

      <WheelInviteModal
        open={inviteOpen}
        firstName={inviteFirstName}
        onAccept={openWheelModal}
        onDismiss={() => setInviteOpen(false)}
      />

      <WheelModal
        open={wheelOpen}
        segments={wheelConfig?.segments || []}
        saving={wheelSaving}
        saveError={wheelSaveError}
        justWon={wheelJustWon}
        onSpinResult={handleSpinResult}
        onClose={closeWheelModal}
      />

      <CookieBanner onOpenPrivacy={() => goTo('privacy')} />

      {/* Design/tuning panel — development only, never shipped to visitors. */}
      {import.meta.env.DEV && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Vibe" />
          <TweakSlider
            label="Gold-Intensität" unit="%"
            value={t.gold} min={20} max={100} step={5}
            onChange={(v) => setTweak('gold', v)}
          />
          <TweakRadio
            label="Hintergrund"
            value={t.bgMode}
            options={[
              { value: 'particles',   label: 'Sand'  },
              { value: 'hieroglyphs', label: 'Hiero' },
              { value: 'clean',       label: 'Clean' },
            ]}
            onChange={(v) => setTweak('bgMode', v)}
          />
          <TweakSection label="Kleopatra" />
          <TweakRadio
            label="3D-Stil"
            value={t.headStyle}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'faceted', label: 'Faceted' },
              { value: 'smooth',  label: 'Smooth'  },
            ]}
            onChange={(v) => setTweak('headStyle', v)}
          />
        </TweaksPanel>
      )}
    </>
  );
}
