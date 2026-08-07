import { useEffect, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { GameBoard } from "@/components/game-board";
import { useUnlockState } from "@/lib/unlockState";

export function HeroSection() {
  const { placed, place, clear } = useUnlockState();
  const [pendingContactScroll, setPendingContactScroll] = useState(false);
  const allPlaced =
    placed.has("me") &&
    placed.has("uiux") &&
    placed.has("frontend") &&
    placed.has("techstack") &&
    placed.has("signal");

  const openContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    place("signal");
    setPendingContactScroll(true);
  };

  useEffect(() => {
    if (!pendingContactScroll || !placed.has("signal")) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("contact")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      setPendingContactScroll(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingContactScroll, placed]);

  const toggleSkip = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (allPlaced) {
      clear();
      setPendingContactScroll(false);
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      return;
    }

    place("me");
    place("uiux");
    place("frontend");
    place("techstack");
    place("signal");
  };

  return (
    <section className="relative h-[100dvh] min-h-[620px] overflow-x-hidden overflow-y-visible bg-white sm:min-h-[680px] lg:min-h-0">
      <GameBoard />
        {/* Left side intro copy. */}
      <div className="pointer-events-none relative z-10 flex h-full w-full max-w-[34rem] flex-col justify-start px-5 pb-36 pt-8 sm:px-8 sm:py-12 md:justify-center lg:w-[42%] lg:px-16">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-3 font-display text-[clamp(3.1rem,16vw,4.8rem)] uppercase leading-none tracking-wide md:text-7xl xl:text-8xl"
        >
          Martin Luspo
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-4 font-sans text-lg font-bold text-primary sm:text-xl md:text-2xl"
        >
          Frontend &amp; UI/UX Developer
        </motion.h2>

        <div className="pointer-events-auto mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#contact"
              onClick={openContact}
              className="border-cartoon rounded-lg bg-white px-4 py-2 font-display text-xs font-bold uppercase shadow-cartoon outline-none transition-transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5 sm:text-sm"
            >
              Contact
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="border-cartoon rounded-lg bg-white px-4 py-2 font-display text-xs font-bold uppercase shadow-cartoon outline-none transition-transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5 sm:text-sm"
            >
              Resume
            </a>
          </motion.div>
        </div>

        <div className="space-y-2 font-sans text-base font-semibold leading-snug text-gray-700 sm:space-y-3 md:text-xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            I design and build playful, accessible React interfaces.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
          >
            Studying design and code - obsessed with details.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64 }}
            className="text-sm text-gray-400 sm:text-base"
          >
            Drag or tap units to unlock sections.
          </motion.p>
        </div>
      </div>

      
      <motion.button
        type="button"
        onClick={toggleSkip}
        aria-label={allPlaced ? "Clear all unlocked portfolio sections" : "Unlock all portfolio sections"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="pointer-events-auto absolute bottom-3 right-4 z-50 font-display text-sm font-black uppercase tracking-widest text-black outline-none transition-transform hover:-translate-y-1 hover:text-primary focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:bottom-6 sm:right-6 sm:text-base"
      >
        {allPlaced ? "Clear All" : "Skip"}
      </motion.button>
    </section>
  );
}
