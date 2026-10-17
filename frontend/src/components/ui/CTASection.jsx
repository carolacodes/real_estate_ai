import useTranslation from "../../i18n/useTranslation.js";
import { Link } from "react-router-dom";
export default function CTASection({
  eyebrow = 'Private Advisory Access',
  title = 'Begin Your Acquisition Journey with Intelligent Precision.',
  description = 'Engage directly with our autonomous spatial intelligence or schedule a confidential briefing with an AURA Managing Partner in Geneva, New York, or London.',
  children
}) {
  const {
    t
  } = useTranslation();
  return <section className="w-full py-20 px-margin-mobile md:px-margin mb-12">
<div className="max-w-[1440px] mx-auto rounded-2xl bg-primary text-primary-foreground relative overflow-hidden shadow-2xl p-8 md:p-16">

<div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-hover/20 blur-[100px] pointer-events-none"></div>
<div className="relative z-10 max-w-3xl space-y-6">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-primary-fixed-dim font-label-sm text-label-sm tracking-wider uppercase">
          {t(eyebrow)}
        </div>
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-semibold tracking-tight">
          {t(title)}
        </h2>
<p className="font-body-lg text-body-lg text-primary-fixed-dim leading-relaxed">
          {t(description)}
        </p>
<div className="flex flex-wrap items-center gap-4 pt-4">
{children ?? <>
<button className="px-8 py-4 rounded-DEFAULT bg-primary-foreground text-text-main font-label-md text-label-md hover:bg-surface-subtle transition-all shadow-md flex items-center gap-2.5" disabled title={t("AI Concierge \u2014 coming soon")} type="button">
<span className="material-symbols-outlined text-[20px] text-accent-hover">auto_awesome</span>
<span>{t("Launch AI Concierge")}</span>
</button>
<Link className="px-8 py-4 rounded-DEFAULT bg-surface-variant/20 backdrop-blur-md text-primary-foreground font-label-md text-label-md hover:bg-surface-variant/30 transition-all flex items-center gap-2" to="/contact">
<span>{t("Speak with Senior Partner")}</span>
<span className="material-symbols-outlined text-[18px]">north_east</span>
</Link>
</>}
</div>
</div>
</div>
</section>;
}
