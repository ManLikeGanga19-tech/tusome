import Image from "next/image";
import Navbar from '@/components/Navbar/page';
import Hero from '@/components/Hero/page';
import About from '@/components/About/page';
import Pricing from '@/components/Pricing/page';
import Footer from "@/components/Footer/page";
export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <Pricing />
      <Footer />
    </div>
  );
}
