import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';
import { Hero } from '../components/home/hero';
import { Features } from '../components/home/feature';
import { HowItWorks } from '../components/home/howItWorks';
import { CTA } from '../components/home/CTA';
import { AnimatedBackground } from '../components/ui/animatedBackground';

export function HomePage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground intensity={0.5} />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}