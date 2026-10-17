import useTranslation from "../../i18n/useTranslation.js";
export default function SectionHeader({
  eyebrow,
  title,
  children,
  centered = false
}) {
  const {
    t
  } = useTranslation();
  return <div className={`flex flex-col gap-6 mb-16 ${centered ? 'text-center items-center' : 'md:flex-row md:items-end justify-between'}`}>
    <div>
      <div className={`flex items-center gap-2 mb-2 ${centered ? 'justify-center' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-accent-hover" aria-hidden="true" />
        <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-text-muted">{t(eyebrow)}</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main font-semibold">{t(title)}</h2>
    </div>
    {children}
  </div>;
}
