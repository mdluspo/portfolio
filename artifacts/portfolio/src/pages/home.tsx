import { useEffect, useRef, useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { DesignProcessSection } from "@/components/design-process-section";
import { ProjectsSection } from "@/components/projects-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { UnlockProvider } from "@/lib/unlockState";
import { useUnlockState } from "@/lib/unlockState";
import type { TowerKey } from "@/lib/unlockState";

const SECTION_KEYS: TowerKey[] = ["uiux", "frontend", "techstack", "signal"];
const ALL_UNIT_KEYS: TowerKey[] = ["me", ...SECTION_KEYS];
const LOCKED_HINT_SOUND_COOLDOWN_MS = 120;

function PageContent() {
  const { placed, place } = useUnlockState();
  const [showLockedHint, setShowLockedHint] = useState(false);
  const [lockedHintMessage, setLockedHintMessage] = useState("Deploy another unit to unlock the next section.");
  const lockedHintTimeoutRef = useRef<number | null>(null);
  const lockedHintSwapTimeoutRef = useRef<number | null>(null);
  const lockedHintVisibleRef = useRef(false);
  const lockedHintMessageRef = useRef("Deploy another unit to unlock the next section.");
  const touchStartYRef = useRef<number | null>(null);
  const lockedHintAudioRef = useRef<HTMLAudioElement | null>(null);
  const lockedHintLastSoundRef = useRef(Number.NEGATIVE_INFINITY);
  const lockedScrollCountRef = useRef(0);
  const lockedScrollLastCountRef = useRef(Number.NEGATIVE_INFINITY);
  const lockedAutoDeployRef = useRef(false);

  const hasUnlockedSection = SECTION_KEYS.some((k) => placed.has(k));
  const allUnlocked = SECTION_KEYS.every((k) => placed.has(k));
  const shouldShowScrollHint = !hasUnlockedSection;

  const setLockedHintVisible = (visible: boolean) => {
    lockedHintVisibleRef.current = visible;
    setShowLockedHint(visible);
  };

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.removeItem("portfolio-theme");
  }, []);


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

  useEffect(() => {
    if (!shouldShowScrollHint) {
      setLockedHintVisible(false);
      lockedScrollCountRef.current = 0;
      lockedAutoDeployRef.current = false;
      return;
    }

    const playLockedHintSound = () => {
      const audio = lockedHintAudioRef.current;
      if (!audio) return;

      const sound = audio.cloneNode(true) as HTMLAudioElement;
      sound.currentTime = 0;
      sound.volume = 0.7;
      sound.play().catch(() => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      });
    };

    const showHint = (message: string) => {
      const now = performance.now();
      if (now - lockedHintLastSoundRef.current > LOCKED_HINT_SOUND_COOLDOWN_MS) {
        lockedHintLastSoundRef.current = now;
        playLockedHintSound();
      }

      const revealMessage = () => {
        lockedHintMessageRef.current = message;
        setLockedHintMessage(message);
        setLockedHintVisible(true);
      };

      if (lockedHintSwapTimeoutRef.current) {
        window.clearTimeout(lockedHintSwapTimeoutRef.current);
        lockedHintSwapTimeoutRef.current = null;
      }

      if (lockedHintVisibleRef.current && lockedHintMessageRef.current !== message) {
        setLockedHintVisible(false);
        lockedHintSwapTimeoutRef.current = window.setTimeout(() => {
          revealMessage();
          lockedHintSwapTimeoutRef.current = null;
        }, 120);
      } else {
        revealMessage();
      }

      if (lockedHintTimeoutRef.current) {
        window.clearTimeout(lockedHintTimeoutRef.current);
      }
      lockedHintTimeoutRef.current = window.setTimeout(() => {
        setLockedHintVisible(false);
      }, 1800);
    };

    const handleLockedScrollAttempt = () => {
      const now = performance.now();
      if (now - lockedScrollLastCountRef.current < 420 || lockedAutoDeployRef.current) {
        return;
      }

      lockedScrollLastCountRef.current = now;
      lockedScrollCountRef.current += 1;
      const count = lockedScrollCountRef.current;

      if (count >= 6) {
        lockedAutoDeployRef.current = true;
        showHint("Fine, I'll do it myself.");
        window.setTimeout(() => {
          ALL_UNIT_KEYS.forEach((key) => place(key));
        }, 450);
        return;
      }

      if (count >= 5) {
        showHint("Place a unit.");
        return;
      }

      if (count >= 3) {
        showHint("What are you doing? Place a unit.");
        return;
      }

      showHint("Deploy another unit to unlock the next section.");
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 8) handleLockedScrollAttempt();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (typeof startY !== "number" || typeof currentY !== "number") return;
      if (startY - currentY > 14) handleLockedScrollAttempt();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (lockedHintTimeoutRef.current) {
        window.clearTimeout(lockedHintTimeoutRef.current);
        lockedHintTimeoutRef.current = null;
      }
      if (lockedHintSwapTimeoutRef.current) {
        window.clearTimeout(lockedHintSwapTimeoutRef.current);
        lockedHintSwapTimeoutRef.current = null;
      }
    };
  }, [place, shouldShowScrollHint]);

  return (
    <div className="portfolio-shell w-full overflow-x-clip bg-white text-black">
      <audio ref={lockedHintAudioRef} src="/locked-scroll-hint.wav" preload="auto" />
      <div
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 top-4 z-[80] flex max-w-[min(92vw,28rem)] -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-150 ease-out ${
          showLockedHint ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-fit max-w-full whitespace-normal rounded-xl border-[3px] border-black bg-white px-4 py-3 text-center font-display text-xs font-black uppercase tracking-wide shadow-[4px_4px_0_0_#000] sm:whitespace-nowrap sm:text-sm">
          {lockedHintMessage}
        </div>
        {lockedHintMessage !== "Fine, I'll do it myself." && (
          <img
            src="/jump-point-up-stop-motion.gif"
            alt=""
            className="h-28 w-auto object-contain drop-shadow-[3px_3px_0_rgba(0,0,0,0.28)] sm:h-36"
            draggable={false}
          />
        )}
      </div>
      <HeroSection />
      {placed.has("uiux") && <DesignProcessSection />}
      {placed.has("frontend") && <ProjectsSection />}
      {placed.has("techstack") && <SkillsSection />}
      {placed.has("signal") && <ContactSection />}
      {allUnlocked && <Footer />}
      {hasUnlockedSection && <ScrollToTop />}
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
