import Image from "next/image";
import Hero from '@/components/Hero/page';
import About from '@/components/About/page';
import Pricing from '@/components/Pricing/page';
export default function Home() {
  return (
    // navbar and footer displayed on the layout page
    <div className="min-h-screen overflow-x-hidden">
      <Hero />
      <About />
      <Pricing />
    </div>
  );
}
