import useTranslation from "../i18n/useTranslation.js";
import PageMetadata from '../components/seo/PageMetadata.jsx';
import { pageMetadata } from '../utils/metadata.js';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import CTASection from '../components/ui/CTASection.jsx';
const fieldClassName = 'w-full min-w-0 px-3.5 py-3 rounded-DEFAULT bg-surface-subtle border border-border font-body-sm text-body-sm text-text-main placeholder:text-text-subtle focus:border-text-main transition-colors';
const labelClassName = 'block mb-2 font-label-md text-label-md text-text-main';
function DemoContactForm() {
  const {
    t
  } = useTranslation();
  const [status, setStatus] = useState('idle');
  function submitDemo(event) {
    event.preventDefault();
    // Portfolio demo: no requests, persistence, email delivery or contact service.
    setStatus('submitted');
  }
  return <form onSubmit={submitDemo} aria-labelledby="contact-form-title" aria-describedby="contact-demo-note" autoComplete="off" className="min-w-0 p-6 sm:p-8 rounded-xl bg-surface-card border border-border-subtle shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <h3 id="contact-form-title" className="font-headline-sm text-headline-sm font-semibold">{t("Start a conversation")}</h3>
      <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-border-subtle font-label-sm text-[10px] uppercase tracking-wider text-text-muted">{t("Demo only")}</span>
    </div>
    <p id="contact-demo-note" className="font-body-sm text-body-sm text-text-muted leading-relaxed mb-8">{t("This form is a portfolio demonstration. Nothing is sent or stored. Please use sample details when trying it.")}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="min-w-0">
        <label htmlFor="contact-full-name" className={labelClassName}>{t("Full Name")}{" "}<span className="text-text-muted">{t("(required)")}</span></label>
        <input id="contact-full-name" type="text" required maxLength={100} className={fieldClassName} />
      </div>
      <div className="min-w-0">
        <label htmlFor="contact-email" className={labelClassName}>{t("Email")}{" "}<span className="text-text-muted">{t("(required)")}</span></label>
        <input id="contact-email" type="email" required maxLength={254} className={fieldClassName} />
      </div>
      <div className="min-w-0">
        <label htmlFor="contact-phone" className={labelClassName}>{t("Phone")}{" "}<span className="text-text-muted">{t("(optional)")}</span></label>
        <input id="contact-phone" type="tel" maxLength={40} className={fieldClassName} />
      </div>
      <div className="min-w-0">
        <label htmlFor="contact-subject" className={labelClassName}>{t("Subject")}{" "}<span className="text-text-muted">{t("(required)")}</span></label>
        <select id="contact-subject" required defaultValue="" className={fieldClassName}>
          <option value="" disabled>{t("Select a subject")}</option>
          <option value="property-search">{t("Property Search")}</option>
          <option value="property-information">{t("Property Information")}</option>
          <option value="viewing-demo">{t("Schedule Viewing \u2014 Demo")}</option>
          <option value="general">{t("General Question")}</option>
        </select>
      </div>
      <div className="sm:col-span-2 min-w-0">
        <label htmlFor="contact-message" className={labelClassName}>{t("Message")}{" "}<span className="text-text-muted">{t("(required)")}</span></label>
        <textarea id="contact-message" required maxLength={2000} rows={5} className={`${fieldClassName} block resize-y`} />
      </div>
    </div>
    <div className="mt-6">
      <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface shadow-md transition-colors">{t("Send Message")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
      <p role="status" aria-live="polite" aria-atomic="true" className={status === 'submitted' ? 'mt-4 p-3.5 rounded-lg bg-surface-subtle border border-border-subtle font-body-sm text-body-sm text-text-main' : 'sr-only'}>{status === 'submitted' ? t("Demo form \u2014 no message was sent.") : ""}</p>
    </div>
  </form>;
}
export default function Contact() {
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
    <PageMetadata {...pageMetadata.contact} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background">
      <section aria-labelledby="contact-title" className="relative w-full py-16 md:py-20 overflow-hidden">
        <div aria-hidden="true" className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-tertiary-fixed/30 blur-[130px] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-card shadow-sm mb-8">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-accent-hover" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{t("Contact AURA")}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <h1 id="contact-title" className="lg:col-span-7 font-display-hero text-display-hero-mobile md:text-display-hero font-semibold leading-tight tracking-tight">{t("Let\u2019s find")}<br /><span className="italic font-normal text-secondary">{t("the right property.")}</span></h1>
            <div className="lg:col-span-5 space-y-6 min-w-0">
              <p className="font-body-lg text-body-lg text-text-muted leading-relaxed">{t("Tell us what you\u2019re looking for, or use the AI Property Advisor to explore available properties instantly.")}</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button type="button" disabled aria-describedby="contact-hero-ai-hint" className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md shadow-md disabled:opacity-60"><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">auto_awesome</span>{t("Ask AI Advisor")}</button>
                <Link to="/properties" className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-DEFAULT bg-surface-subtle border border-border font-label-md text-label-md hover:bg-secondary-fixed transition-colors">{t("Explore Properties")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
              </div>
              <p id="contact-hero-ai-hint" className="font-body-sm text-body-sm text-text-muted">{t("To open the advisor, use the AI Advisor button at the bottom right of this page.")}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t("Contact options and demo form")} className="w-full py-16 md:py-20 bg-surface-subtle">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 min-w-0">
            <SectionHeader eyebrow={t("Contact Options")} title={t("A clear place to start.")} />
            <p className="font-body-lg text-body-lg text-text-muted leading-relaxed">{t("AURA is a fictional real estate platform built for a portfolio. Explore the working property search, or try the form to see the contact experience.")}</p>
            <dl className="mt-8 space-y-6">
              <div className="pb-6 border-b border-border">
                <dt className="font-headline-sm text-headline-sm font-semibold">{t("AI Property Advisor")}</dt>
                <dd className="font-body-sm text-body-sm text-text-muted mt-2 leading-relaxed">{t("Available directly on this website. Share your preferences to explore matching listings.")}</dd>
              </div>
              <div className="pb-6 border-b border-border">
                <dt className="font-headline-sm text-headline-sm font-semibold">{t("Dubai-focused discovery")}</dt>
                <dd className="font-body-sm text-body-sm text-text-muted mt-2 leading-relaxed">{t("Browse property details, locations and prices in AED, all in one place.")}</dd>
              </div>
              <div>
                <dt className="font-headline-sm text-headline-sm font-semibold">{t("Schedule Viewing \u2014 Demo")}</dt>
                <dd className="font-body-sm text-body-sm text-text-muted mt-2 leading-relaxed">{t("A concept for the browsing experience. This portfolio does not accept viewing requests or bookings.")}</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7 min-w-0"><DemoContactForm /></div>
        </div>
      </section>

      <CTASection eyebrow={t("AI-assisted discovery")} title={t("Prefer a faster way to search?")} description={t("Tell the AI Property Advisor your budget, preferred area and property type to get matching options instantly.")}>
        <div className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button type="button" disabled aria-describedby="contact-advisor-hint" className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 rounded-DEFAULT bg-primary-foreground text-text-main font-label-md text-label-md shadow-md disabled:opacity-60"><span aria-hidden="true" className="material-symbols-outlined text-[20px] text-accent-hover">auto_awesome</span>{t("Open AI Property Advisor")}</button>
            <Link to="/properties" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-DEFAULT bg-surface-variant/20 backdrop-blur-md text-primary-foreground font-label-md text-label-md hover:bg-surface-variant/30 transition-colors">{t("Explore Properties")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
          </div>
          <p id="contact-advisor-hint" className="font-body-sm text-body-sm text-primary-fixed-dim">{t("Use the AI Advisor button at the bottom right to open the live chat.")}</p>
        </div>
      </CTASection>
    </main>
    <Footer />
  </>;
}
