import PageHead from './PageHead';

export function Imprint({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Impressum · § 5 TMG"
        title="Impres" titleEm="sum"
        meta={<>
          <b>Pflichtangaben</b>
          <div>Kleopatra INK</div>
          <div>Gunzenhausen</div>
        </>}
        onBack={onBack}
      />

      <div className="legal-content">
        <section>
          <h2 className="legal-h2">Anbieter</h2>
          <p>
            Nadia Reyhani<br />
            Kleopatra INK – Tattoo &amp; Piercing<br />
            Marktplatz 7<br />
            91710 Gunzenhausen<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Kontakt</h2>
          <p>
            Telefon: <a className="legal-link" href="tel:+49983168421">+49 9831 6 84 21</a><br />
            E-Mail: <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27&nbsp;a UStG:<br />
            <em className="legal-todo">[USt-IdNr. eintragen – sonst Hinweis: „Kleinunternehmer nach § 19 UStG"]</em>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>
            Nadia Reyhani<br />
            Marktplatz 7, 91710 Gunzenhausen
          </p>
        </section>

        <section>
          <h2 className="legal-h2">EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a className="legal-link" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse findest du oben.
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungs­verfahren vor einer
            Verbraucher­schlichtungs­stelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechts­widrige
            Tätigkeit hinweisen.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
            übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
            oder Betreiber der Seiten verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unter­liegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </div>
  );
}

export function Privacy({ onBack }) {
  return (
    <div className="page with-bg">
      <PageHead
        kicker="Datenschutz · DSGVO"
        title="Daten" titleEm="schutz"
        meta={<>
          <b>Stand: Mai 2026</b>
          <div>DSGVO-konform</div>
          <div>Kleopatra INK</div>
        </>}
        onBack={onBack}
      />

      <div className="legal-content">
        <section>
          <h2 className="legal-h2">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
            Nadia Reyhani — Kleopatra INK<br />
            Marktplatz 7, 91710 Gunzenhausen<br />
            E-Mail: <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a><br />
            Telefon: <a className="legal-link" href="tel:+49983168421">+49 9831 6 84 21</a>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">2. Allgemeines zur Datenverarbeitung</h2>
          <p>
            Wir erheben und verwenden personen­bezogene Daten nur, soweit dies zur Bereitstellung
            einer funktions­fähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
            Rechts­grundlage ist je nach Verarbeitung Art. 6 Abs. 1 lit. a, b, c oder f DSGVO.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">3. Server-Logfiles</h2>
          <p>
            Beim Aufruf der Website werden technisch notwendige Daten (IP-Adresse, Datum/Uhrzeit,
            User-Agent, aufgerufene Seite) durch unseren Hosting-Provider verarbeitet.
            Rechts­grundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem stabilen
            Betrieb). Speicherdauer: max. 7 Tage.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">4. Cookies &amp; lokaler Speicher</h2>
          <p>
            Wir verwenden nur technisch notwendige Cookies bzw. localStorage-Einträge, sowie nach
            deiner Einwilligung optionale funktionale Inhalte. Du kannst deine Einwilligung jederzeit
            widerrufen, indem du den Browser­speicher leerst oder uns kontaktierst.
          </p>
          <ul className="legal-list">
            <li><b>kink_consent_v1</b> – speichert deine Cookie-Auswahl (essenziell, kein Ablauf, localStorage).</li>
            <li><b>Firebase Auth Session</b> – nur bei Login aktiv, dient der Anmeldung.</li>
          </ul>
        </section>

        <section>
          <h2 className="legal-h2">5. Termin- und Kontaktanfragen</h2>
          <p>
            Wenn du eine Termin­anfrage oder Piercing-Anfrage stellst, verarbeiten wir Name,
            E-Mail-Adresse, optional Telefonnummer und deine Nachricht. Diese Daten verwenden wir
            ausschließlich zur Bearbeitung deiner Anfrage. Rechts­grundlage: Art. 6 Abs. 1 lit. b
            DSGVO (vorvertragliche Maßnahmen). Speicherdauer: bis zum Abschluss des Anliegens, danach
            gemäß handels- und steuer­rechtlicher Aufbewahrungs­pflichten.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">6. Kunden-Account (Firebase Authentication)</h2>
          <p>
            Wenn du einen Account erstellst, nutzen wir Firebase Authentication (Google Ireland Ltd.,
            Gordon House, Barrow Street, Dublin 4, Irland) sowie Cloud Firestore zur Speicherung
            deines Profils (Name, E-Mail, Telefon). Daten können dabei in Rechen­zentren in der EU
            sowie ggf. in die USA übertragen werden — Google ist gemäß EU-US Data Privacy Framework
            zertifiziert. Rechts­grundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag), Art. 46 DSGVO
            (Standard­vertrags­klauseln).
          </p>
          <p>
            Du kannst deinen Account jederzeit löschen lassen — schreib uns kurz eine E-Mail.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">7. Google Fonts</h2>
          <p>
            Wir binden Schriften von Google Fonts (Google Ireland Ltd.) ein. Beim Aufruf der Seite
            stellt dein Browser eine Verbindung zu fonts.googleapis.com und fonts.gstatic.com her,
            wodurch deine IP-Adresse an Google übermittelt werden kann. Rechtsgrundlage: Art. 6
            Abs. 1 lit. a DSGVO (Einwilligung über den Cookie-Banner) bzw. lit. f (berechtigtes
            Interesse an einer ansprechenden Darstellung).
          </p>
        </section>

        <section>
          <h2 className="legal-h2">8. Instagram-Einbindung</h2>
          <p>
            Auf der Seite „Instagram" zeigen wir Inhalte aus unserem Instagram-Profil
            (@kleopatra.ink). Der Abruf erfolgt serverseitig über die Instagram Graph API; es werden
            keine Tracking-Skripte von Meta direkt eingebunden. Beim Klick auf einen Beitrag wirst du
            zu Instagram weitergeleitet — es gilt dann die Datenschutz­erklärung von Meta Platforms
            Ireland Ltd.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">9. Hosting &amp; Backend</h2>
          <p>
            Diese Website wird bei einem in der EU/EWR ansässigen Hosting-Provider betrieben. Der
            Provider verarbeitet personen­bezogene Daten ausschließlich auf unsere Weisung im Rahmen
            eines Auftrags­verarbeitungs­vertrages gemäß Art. 28 DSGVO.
          </p>
        </section>

        <section>
          <h2 className="legal-h2">10. Deine Rechte</h2>
          <p>Du hast jederzeit das Recht:</p>
          <ul className="legal-list">
            <li>auf Auskunft über deine gespeicherten Daten (Art. 15 DSGVO),</li>
            <li>auf Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
            <li>auf Löschung (Art. 17 DSGVO),</li>
            <li>auf Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
            <li>auf Datenübertrag­barkeit (Art. 20 DSGVO),</li>
            <li>auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO),</li>
            <li>auf Widerruf deiner Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO),</li>
            <li>auf Beschwerde bei einer Aufsichts­behörde (Art. 77 DSGVO) — z.&nbsp;B. dem Bayerischen Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.</li>
          </ul>
        </section>

        <section>
          <h2 className="legal-h2">11. Kontakt für Datenschutzanfragen</h2>
          <p>
            Für alle Fragen zum Datenschutz erreichst du uns unter{' '}
            <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export function SiteFooter({ onNav }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" aria-label="Seitenfuß">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-mark">K</span>
          <span>KLEOPATRA <span style={{ color: 'var(--ivory-dim)' }}>INK</span></span>
        </div>
        <nav className="site-footer-nav" aria-label="Rechtliche Hinweise">
          <button type="button" onClick={() => onNav('imprint')}>Impressum</button>
          <span className="site-footer-sep" aria-hidden="true">·</span>
          <button type="button" onClick={() => onNav('privacy')}>Datenschutz</button>
        </nav>
        <div className="site-footer-meta">
          © {year} Kleopatra INK · Marktplatz 7, 91710 Gunzenhausen
        </div>
      </div>
    </footer>
  );
}
