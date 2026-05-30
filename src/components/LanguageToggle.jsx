import { LANGUAGES, useI18n } from '../i18n';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={`lang-toggle ${className}`}
      role="group"
      aria-label={t.common.langName}
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-toggle-btn ${lang === l.code ? 'active' : ''}`}
          aria-pressed={lang === l.code}
          title={l.name}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
