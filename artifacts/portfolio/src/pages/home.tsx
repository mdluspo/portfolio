import { useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { DesignProcessSection } from "@/components/design-process-section";
import { ProjectsSection } from "@/components/projects-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { UnlockProvider } from "@/lib/unlockState";
import { useUnlockState } from "@/lib/unlockState";
import type { TowerKey } from "@/lib/unlockState";

const SECTION_KEYS: TowerKey[] = ["uiux", "frontend", "techstack", "signal"];

function PageContent() {
  const { placed } = useUnlockState();

  const hasUnlockedSection = SECTION_KEYS.some((k) => placed.has(k));
  const allUnlocked = SECTION_KEYS.every((k) => placed.has(k));
  useEffect(() => {
    if (hasUnlockedSection) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    } else {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [hasUnlockedSection]);

  return (
    <div className="w-full bg-white text-black">
      <HeroSection />
      {placed.has("uiux") && <DesignProcessSection />}
      {placed.has("frontend") && <ProjectsSection />}
      {placed.has("techstack") && <SkillsSection />}
      {placed.has("signal") && <ContactSection />}
      {allUnlocked && <Footer />}
    </div>
  );
}

export default function Home() {
  return (
    <UnlockProvider>
      <PageContent />
    </UnlockProvider>
  );
}
