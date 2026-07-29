import { motion } from "framer-motion";
import { GameBoard } from "@/components/game-board";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const [placedCount, setPlacedCount] = useState(0);

  const scrollToWork = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[100dvh] relative flex flex-col items-center justify-center pt-20 pb-10 px-4 md:px-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />

      <div className="text-center mb-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-white border-cartoon px-4 py-2 rounded-full shadow-cartoon-sm mb-6"
        >
          <span className="font-display font-bold tracking-wide uppercase text-sm">
            Level 1: The Introduction
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display text-black mb-4 uppercase drop-shadow-[2px_2px_0_#fff,4px_4px_0_#5B9BD5]"
        >
          Place Your Units
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl font-sans font-bold text-gray-700 max-w-lg mx-auto"
        >
          Deploy units on the grid below to unlock information and build the defense.
        </motion.p>
      </div>

      <GameBoard onUnitsPlacedCountChange={setPlacedCount} />

      {/* Scroll indicator - appears after 2 units are placed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: placedCount >= 2 ? 1 : 0, 
          y: placedCount >= 2 ? 0 : 20,
          pointerEvents: placedCount >= 2 ? "auto" : "none"
        }}
        className="mt-16 z-10"
      >
        <Button onClick={scrollToWork} variant="primary" className="gap-2">
          See my work <ArrowDown size={20} strokeWidth={3} />
        </Button>
      </motion.div>
    </section>
  );
}
