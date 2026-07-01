import { STUDIO_ADDRESS, STUDIO_ADDRESS_LINE, STUDIO_MOBILE } from '../data/contact';
import { useI18n } from '../i18n';
import PageHead from './PageHead';


export function Imprint({ onBack }) {
  const { t } = useI18n();
  const m = t.imprint;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={m.kicker}
        title={m.title} titleEm={m.titleEm}
        meta={<>
          <b>{m.metaMandatory}</b>
          <div>{m.metaBrand}</div>
          <div>{m.metaCity}</div>
        </>}
        onBack={onBack}
      />

      <div className="legal-content">
        <section>
          <h2 className="legal-h2">{m.provider}</h2>
          <p>
            Nadia Reyhani<br />
            Kleopatra INK – Tattoo &amp; Piercing<br />
            {STUDIO_ADDRESS.street}<br />
            {STUDIO_ADDRESS.zip} {STUDIO_ADDRESS.city}<br />
            {STUDIO_ADDRESS.country}
          </p>
        </section>

        <section>
          <h2 className="legal-h2">{m.contact}</h2>
          <p>
            {t.contact.labelMobile}: <a className="legal-link" href={`tel:${STUDIO_MOBILE.tel}`}>{STUDIO_MOBILE.display}</a><br />
            {t.account.email}: <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">{m.vatId}</h2>
          <p>
            {m.vatText}<br />
            <em className="legal-todo">{m.vatTodo}</em>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">{m.responsible}</h2>
          <p>
            Nadia Reyhani<br />
            {STUDIO_ADDRESS_LINE}
          </p>
        </section>

        <section>
          <h2 className="legal-h2">{m.euDispute}</h2>
          <p>
            {m.euDisputeText1Pre}
            <a className="legal-link" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            {m.euDisputeText1Post}
          </p>
          <p>{m.euDisputeText2}</p>
        </section>

        <section>
          <h2 className="legal-h2">{m.liabilityContent}</h2>
          <p>{m.liabilityContentText}</p>
        </section>

        <section>
          <h2 className="legal-h2">{m.liabilityLinks}</h2>
          <p>{m.liabilityLinksText}</p>
        </section>

        <section>
          <h2 className="legal-h2">{m.copyright}</h2>
          <p>{m.copyrightText}</p>
        </section>
      </div>
    </div>
  );
}

export function Privacy({ onBack }) {
  const { t } = useI18n();
  const p = t.privacy;
  return (
    <div className="page with-bg">
      <PageHead
        kicker={p.kicker}
        title={p.title} titleEm={p.titleEm}
        meta={<>
          <b>{p.metaStand}</b>
          <div>{p.metaConform}</div>
          <div>{p.metaBrand}</div>
        </>}
        onBack={onBack}
      />

      <div className="legal-content">
        <section>
          <h2 className="legal-h2">{p.s1Title}</h2>
          <p>
            {p.s1Pre}<br />
            Nadia Reyhani — Kleopatra INK<br />
            {STUDIO_ADDRESS_LINE}<br />
            {t.account.email}: <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a><br />
            {t.contact.labelMobile}: <a className="legal-link" href={`tel:${STUDIO_MOBILE.tel}`}>{STUDIO_MOBILE.display}</a>
          </p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s2Title}</h2>
          <p>{p.s2Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s3Title}</h2>
          <p>{p.s3Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s4Title}</h2>
          <p>{p.s4Text}</p>
          <ul className="legal-list">
            <li><b>kink_consent_v1</b>{p.s4Li1}</li>
            <li><b>{p.s4Li2Name}</b>{p.s4Li2}</li>
          </ul>
        </section>

        <section>
          <h2 className="legal-h2">{p.s5Title}</h2>
          <p>{p.s5Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s6Title}</h2>
          <p>{p.s6Text1}</p>
          <p>{p.s6Text2}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s7Title}</h2>
          <p>{p.s7Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s8Title}</h2>
          <p>{p.s8Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s9Title}</h2>
          <p>{p.s9Text}</p>
        </section>

        <section>
          <h2 className="legal-h2">{p.s10Title}</h2>
          <p>{p.s10Pre}</p>
          <ul className="legal-list">
            {p.s10List.map((li, i) => <li key={i}>{li}</li>)}
            <li>{p.s10Authority}</li>
          </ul>
        </section>

        <section>
          <h2 className="legal-h2">{p.s11Title}</h2>
          <p>
            {p.s11Pre}
            <a className="legal-link" href="mailto:hallo@kleopatraink.de">hallo@kleopatraink.de</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export function SiteFooter({ onNav }) {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" aria-label={t.footer.aria}>
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-mark">K</span>
          <span>KLEOPATRA <span style={{ color: 'var(--ivory-dim)' }}>INK</span></span>
        </div>
        <nav className="site-footer-nav" aria-label={t.footer.legalAria}>
          <button type="button" onClick={() => onNav('imprint')}>{t.footer.imprint}</button>
          <span className="site-footer-sep" aria-hidden="true">·</span>
          <button type="button" onClick={() => onNav('privacy')}>{t.footer.privacy}</button>
        </nav>
        <div className="site-footer-meta">
          {t.footer.meta(year)}
        </div>
      </div>
    </footer>
  );
}
