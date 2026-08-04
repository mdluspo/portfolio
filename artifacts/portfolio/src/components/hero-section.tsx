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
    <section className="relative h-[100dvh] bg-white overflow-x-hidden overflow-y-visible">
      <GameBoard />
      {/* LEFT — pure white, no card, no box, no border */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-center px-10 py-12 lg:w-[42%] lg:px-16">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-7xl xl:text-8xl font-display uppercase tracking-wide leading-none mb-3"
        >
          Martin Luspo
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-xl md:text-2xl font-sans font-bold text-primary mb-4"
        >
          Frontend &amp; UI/UX Developer
        </motion.h2>

        <div className="pointer-events-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#contact"
              onClick={openContact}
              className="border-cartoon bg-white px-5 py-2 rounded-lg font-display font-bold text-sm uppercase shadow-cartoon outline-none hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-transform"
            >
              Contact
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="border-cartoon bg-white px-5 py-2 rounded-lg font-display font-bold text-sm uppercase shadow-cartoon outline-none hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-transform"
            >
              Resume
            </a>
          </motion.div>
        </div>

        <div className="space-y-3 font-sans font-semibold text-gray-700 text-lg md:text-xl">
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
            Studying design &amp; code — obsessed with details.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64 }}
            className="text-gray-400 text-base"
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
        className="pointer-events-auto absolute bottom-6 right-6 z-50 font-display text-base font-black uppercase tracking-widest text-black outline-none transition-transform hover:-translate-y-1 hover:text-primary focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {allPlaced ? "Clear All" : "Skip"}
      </motion.button>
    </section>
  );
}
