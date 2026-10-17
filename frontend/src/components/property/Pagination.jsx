import useTranslation from "../../i18n/useTranslation.js";
export default function Pagination({
  pagination,
  onChange
}) {
  const {
    t
  } = useTranslation();
  if (!pagination || pagination.totalPages === 0) return null;
  const {
    page,
    limit,
    total,
    totalPages
  } = pagination;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter(value => value > 0 && value <= totalPages).sort((a, b) => a - b);
  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);
  const button = 'w-10 h-10 rounded-DEFAULT bg-surface hover:bg-surface-subtle text-text-main flex items-center justify-center transition-colors disabled:text-text-subtle disabled:opacity-50 disabled:hover:bg-surface shrink-0';
  return <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border-subtle">
    <p className="font-body-sm text-body-sm text-text-muted">{t("Showing {start}–{end} of {total} properties", { start, end, total })}</p>
    <nav aria-label={t("Property pagination")} className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
      <button type="button" className={button} aria-label={t("Previous page")} disabled={page <= 1} onClick={() => onChange(page - 1)}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span></button>
      {pages.map((value, index) => <span key={value} className="flex items-center gap-1.5 sm:gap-2">{index > 0 && value > pages[index - 1] + 1 && <span aria-hidden="true" className="text-text-subtle">…</span>}<button type="button" aria-label={t("Page {value0}", {
          value0: value
        })} aria-current={value === page ? 'page' : undefined} onClick={() => onChange(value)} className={`w-10 h-10 rounded-DEFAULT font-label-md text-label-md flex items-center justify-center transition-colors ${value === page ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface hover:bg-surface-subtle text-text-main'}`}>{value}</button></span>)}
      <button type="button" className={button} aria-label={t("Next page")} disabled={page >= totalPages} onClick={() => onChange(page + 1)}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span></button>
    </nav>
  </div>;
}
