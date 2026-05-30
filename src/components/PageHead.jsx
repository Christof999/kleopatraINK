// Shared page header with a back button, kicker, title and optional meta block.
export default function PageHead({ kicker, title, titleEm, meta, onBack }) {
  return (
    <>
      <button className="page-back" onClick={onBack}>← Zurück</button>
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
