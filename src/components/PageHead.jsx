import { useI18n } from '../i18n';

// Shared page header with a back button, kicker, title and optional meta block.
export default function PageHead({ kicker, title, titleEm, meta, onBack }) {
  const { t } = useI18n();
  return (
    <>
      <button className="page-back" onClick={onBack}>{t.common.back}</button>
      <div className="page-head">
        <div>
          <div className="page-kicker">{kicker}</div>
          <h1 className="page-title">{title}{titleEm && <> <em>{titleEm}</em></>}</h1>
        </div>
        {meta && <div className="page-meta">{meta}</div>}
      </div>
    </>
  );
}
