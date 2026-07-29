import { HeroSection } from "@/components/hero-section";
import { DesignProcessSection } from "@/components/design-process-section";
import { ProjectsSection } from "@/components/projects-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { UnlockProvider } from "@/lib/unlockState";

export default function Home() {
  return (
    <UnlockProvider>
      <div className="w-full bg-white text-black min-h-screen">
        <HeroSection />
        <DesignProcessSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
        <Footer />
      </div>
    </UnlockProvider>
  );
}
