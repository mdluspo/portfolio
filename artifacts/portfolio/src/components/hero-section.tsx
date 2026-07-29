import { motion } from "framer-motion";
import { GameBoard } from "@/components/game-board";

export function HeroSection() {
  return (
    <section className="relative h-[100dvh] bg-white overflow-hidden">
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
          className="text-xl md:text-2xl font-sans font-bold text-primary mb-8"
        >
          Frontend &amp; UI/UX Developer
        </motion.h2>

        <div className="space-y-3 font-sans font-semibold text-gray-700 text-lg md:text-xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            I build interfaces that feel alive.
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
            Drag the towers onto the road to explore.
          </motion.p>
        </div>
      </div>

      {/* RIGHT — game area, same white background, no divider */}
    </section>
  );
}
