import useTranslation from "../../i18n/useTranslation.js";
import { useState } from 'react';
export default function PropertyImage({
  src,
  alt,
  className = '',
  eager = false
}) {
  const {
    t
  } = useTranslation();
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) {
    return <div role="img" aria-label={t("{value0}: image unavailable", {
      value0: alt
    })} className={`property-placeholder flex flex-col items-center justify-center gap-3 text-text-muted ${className}`}>
      <span className="material-symbols-outlined text-5xl" aria-hidden="true">architecture</span>
      <span className="font-label-sm text-label-sm uppercase tracking-[0.2em]">{t("AURA \xB7 Residence")}</span>
    </div>;
  }
  return <img src={src} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} onError={() => setFailedSrc(src)} />;
}
