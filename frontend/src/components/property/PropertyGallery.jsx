import useTranslation from "../../i18n/useTranslation.js";
import PropertyImage from './PropertyImage.jsx';
import Skeleton from '../ui/Skeleton.jsx';

// The gallery accepts multiple images without assuming that extra photos exist.
export default function PropertyGallery({
  images = [],
  title: providedTitle,
  loading = false
}) {
  const {
    t
  } = useTranslation();
  const title = providedTitle ?? t("Property");
  const primary = images[0] || null;
  return <section aria-label={t("Property gallery")} className="w-full bg-background py-8">
    <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 group relative overflow-hidden rounded-lg h-[360px] sm:h-[460px] md:h-[580px] shadow-sm bg-surface-container">
          {loading ? <Skeleton className="w-full h-full" /> : <>
            <PropertyImage eager src={primary} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4"><span className="px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md text-text-main font-label-sm text-label-sm tracking-widest uppercase shadow-sm">{primary ? t("Property Photo") : t("Photo Unavailable")}</span></div>
            <div className="absolute bottom-6 left-6 right-6 text-on-primary"><p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">{t("Property Gallery")}</p><p className="font-headline-sm text-headline-sm font-semibold break-words">{title}</p></div>
          </>}
        </div>
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {[1, 2, 3].map(index => <div key={index} className="group relative overflow-hidden rounded-lg h-[180px] shadow-sm bg-surface-container">
            {loading ? <Skeleton className="w-full h-full" /> : <>
              <PropertyImage src={images[index] || null} alt={t("{value0} \xB7 Photo {value1}", {
                value0: title,
                value1: index + 1
              })} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-on-primary"><span className="font-label-sm text-label-sm font-medium">{images[index] ? t("Photo {value0}", {
                    value0: index + 1
                  }) : t("Additional photo unavailable")}</span></div>
            </>}
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
