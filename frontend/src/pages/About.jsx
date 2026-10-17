import useTranslation from "../i18n/useTranslation.js";
import PageMetadata from '../components/seo/PageMetadata.jsx';
import { pageMetadata } from '../utils/metadata.js';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import CTASection from '../components/ui/CTASection.jsx';
import PropertyImage from '../components/property/PropertyImage.jsx';
const pillars = [{
  icon: 'architecture',
  title: 'Curated Properties',
  description: 'Explore a focused collection of apartments, villas and residences across Dubai, with space to consider what matters to you.'
}, {
  icon: 'auto_awesome',
  title: 'Intelligent Search',
  description: 'Describe your budget, preferred area and the features you need. AI-assisted search helps you find relevant properties in the inventory.'
}, {
  icon: 'description',
  title: 'Clear Information',
  description: 'Compare prices in AED, layouts, furnishing and completion status, with key property details presented in one place.'
}, {
  icon: 'explore',
  title: 'Modern Experience',
  description: 'Move naturally from discovery to property details through a streamlined browsing experience, on desktop or mobile.'
}];
const productFacts = [{
  value: 'Dubai',
  label: 'Focused property discovery'
}, {
  value: 'AI-assisted',
  label: 'Search in your own words'
}, {
  value: 'One platform',
  label: 'Browse, compare and explore'
}];

// Reuse the architectural image already featured on Home, without implying a Dubai location.
const architectureImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHnj5EUBZwYPv8dU5CWxPZFsXvy5QGKSmID2qWjaqZn5TVLYgHhyT49sbHgaayGI02kBnvrg6nAFvKJ_nVAcPwzwpCXWtEd6Z-Gh6nyfkWldIinpvcJ93IfZnn5hqLhf6IxLdY90uBQaZ3bPm_PhwPwKOqy_FXOGsKWv0z82WvTsNVA_8lMBnisU_-Cb9_a37k2pU_Xxopt7b4aOrHJI7k8AWkjq9YChB_Cyfi-cU';
export default function About() {
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
    <PageMetadata {...pageMetadata.about} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background">
      <section aria-labelledby="about-title" className="relative w-full py-16 md:py-24 overflow-hidden">
        <div aria-hidden="true" className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-tertiary-fixed/30 blur-[130px] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-card shadow-sm mb-8">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-accent-hover" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-main font-semibold">{t("About AURA")}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <h1 id="about-title" className="font-display-hero text-display-hero-mobile md:text-display-hero text-text-main font-semibold leading-tight tracking-tight">{t("Real estate,")}<br /><span className="italic font-normal text-secondary">{t("reimagined.")}</span></h1>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <p className="font-body-lg text-body-lg text-text-muted leading-relaxed">{t("AURA combines curated property discovery with AI-powered guidance to help buyers explore opportunities across Dubai with greater clarity.")}</p>
              <Link to="/properties" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface shadow-md transition-colors">{t("Explore Properties")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t("Our approach")} className="w-full py-16 md:py-24 bg-surface">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeader eyebrow={t("Our Approach")} title={t("A more considered way to search.")} />
            <div className="space-y-5 font-body-lg text-body-lg text-text-muted leading-relaxed">
              <p>{t("Finding a property starts with understanding your priorities. We bring curated listings and clear property information together so you can explore with a sense of direction.")}</p>
              <p>{t("Browse by location, budget and property type, or describe what you are looking for to the AI Property Advisor. Each step is designed to make discovery simpler and comparison more useful.")}</p>
            </div>
          </div>
          <figure className="min-w-0">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl bg-surface-subtle">
              <PropertyImage src={architectureImage} alt={t("Contemporary residence with expansive glass windows and landscaped surroundings at dusk")} className="w-full h-full object-cover" />
            </div>
            <figcaption className="mt-4 font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{t("Architecture. Space. Possibility.")}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-label={t("Why AURA")} className="w-full py-16 md:py-24 bg-surface-subtle">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          <SectionHeader eyebrow={t("Why AURA")} title={t("Clarity at every step.")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({
              icon,
              title,
              description
            }) => <article key={title} className="p-8 rounded-xl bg-surface-card shadow-sm">
              <div aria-hidden="true" className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-text-main mb-6"><span className="material-symbols-outlined text-[24px]">{icon}</span></div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t(title)}</h3>
              <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t(description)}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section aria-label={t("Technology and human experience")} className="w-full py-16 md:py-24 bg-surface">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
          <SectionHeader eyebrow={t("Technology + Human Experience")} title={t("Guidance, with perspective.")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 font-body-lg text-body-lg text-text-muted leading-relaxed">
            <p>{t("Technology should make a property search easier to navigate. AURA uses AI to help you express your preferences, discover relevant listings and refine your search as your priorities become clearer.")}</p>
            <p>{t("It is a starting point for informed exploration. AI-powered guidance does not replace professional advice. Confirm property details and seek qualified legal, financial or real estate advice before making a purchase decision.")}</p>
          </div>
        </div>
      </section>

      <section aria-label={t("The AURA experience")} className="w-full py-16 bg-surface-card shadow-sm border-t border-border-subtle">
        <dl className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin grid grid-cols-1 md:grid-cols-3 gap-8">
          {productFacts.map(({
            value,
            label
          }) => <div key={value}>
            <dt className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted mb-2">{t(label)}</dt>
            <dd className="font-headline-lg text-2xl sm:text-headline-lg font-semibold text-text-main">{t(value)}</dd>
          </div>)}
        </dl>
      </section>

      <CTASection eyebrow={t("Your next chapter")} title={t("Find your next property")} description={t("Explore properties across Dubai and discover the spaces that fit your priorities.")}>
        <Link to="/properties" className="px-8 py-4 rounded-DEFAULT bg-primary-foreground text-text-main font-label-md text-label-md hover:bg-surface-subtle transition-colors shadow-md flex items-center gap-2.5">{t("Explore Properties")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
      </CTASection>
    </main>
    <Footer />
  </>;
}
