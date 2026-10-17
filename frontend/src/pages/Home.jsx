import PageMetadata from '../components/seo/PageMetadata.jsx';
import { pageMetadata } from '../utils/metadata.js';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/ui/Hero.jsx';
import FeaturedProperties from '../components/property/FeaturedProperties.jsx';
import PropertyOfTheWeek from '../components/property/PropertyOfTheWeek.jsx';
import WhyChooseUs from '../components/ui/WhyChooseUs.jsx';
import HowItWorks from '../components/ui/HowItWorks.jsx';
import StatsSection from '../components/ui/StatsSection.jsx';
import Testimonials from '../components/ui/Testimonials.jsx';
import CTASection from '../components/ui/CTASection.jsx';
import useFeaturedProperties from '../hooks/useFeaturedProperties.js';
export default function Home() {
  const portfolio = useFeaturedProperties();
  return <>
    <PageMetadata {...pageMetadata.home} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background">
      <Hero featuredCount={portfolio.properties.length} loading={portfolio.loading} error={portfolio.error} />
      <FeaturedProperties {...portfolio} />
      <PropertyOfTheWeek property={portfolio.properties[0]} loading={portfolio.loading} error={portfolio.error} retry={portfolio.retry} />
      <WhyChooseUs />
      <HowItWorks />
      <StatsSection />
      <Testimonials />
      <CTASection />
    </main>
    <Footer />
  </>;
}
