import HeroSection from "@/components/HeroSection";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <HeroSection />
      <Chatbot />
    </main>
  );
}
