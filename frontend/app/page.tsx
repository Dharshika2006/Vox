import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import EmailPreview from "@/components/landing/EmailPreview";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-[#FF6A1A]/20">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        {/* Visual separator */}
        <div className="mx-auto flex w-full max-w-6xl justify-center px-6 sm:px-8">
          <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-60 dark:via-[#3D2314]"></div>
        </div>

        <HowItWorks />
        
        <div className="mx-auto flex w-full max-w-6xl justify-center px-6 sm:px-8">
          <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-60 dark:via-[#3D2314]"></div>
        </div>

        <EmailPreview email={null} />
      </main>

      <Footer />
    </div>
  );
}
