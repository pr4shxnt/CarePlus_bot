import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import WhoItIsFor from "@/components/WhoItIsFor";
import SDGAlignment from "@/components/SDGAlignment";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <WhoItIsFor />
        <SDGAlignment />
      </main>
      <Footer />
    </div>
  );
}
