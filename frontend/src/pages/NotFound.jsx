import useTranslation from "../i18n/useTranslation.js";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import PageMetadata from '../components/seo/PageMetadata.jsx';
import { pageMetadata } from '../utils/metadata.js';
export default function NotFound() {
  const {
    t
  } = useTranslation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);
  return <>
    <PageMetadata {...pageMetadata.notFound} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background flex items-center">
      <section aria-labelledby="not-found-title" className="max-w-[1440px] w-full mx-auto px-margin-mobile md:px-margin py-20 md:py-28 text-center">
        <p className="font-display-hero text-display-hero-mobile md:text-display-hero text-accent-hover font-semibold mb-6">404</p>
        <h1 id="not-found-title" className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-semibold tracking-tight mb-6">{t("Page not found.")}</h1>
        <p className="font-body-lg text-body-lg text-text-muted max-w-xl mx-auto">{t("The page you\u2019re looking for doesn\u2019t exist or may have moved.")}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface shadow-md transition-colors">{t("Back Home")}<span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span></Link>
          <Link to="/properties" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-DEFAULT bg-surface border border-border font-label-md text-label-md hover:bg-surface-subtle transition-colors">{t("Explore Properties")}<span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span></Link>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
