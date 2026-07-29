import { motion } from "framer-motion";
import { GameBoard } from "@/components/game-board";

export function HeroSection() {
  return (
    <section className="min-h-[100dvh] relative flex flex-col lg:flex-row items-stretch bg-white overflow-hidden border-b-[3px] border-black">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-6 py-12 lg:p-12 z-10 relative">
        {/* Subtle background dots for left column */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--primary)) 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-cartoon rounded-3xl p-8 md:p-10 shadow-cartoon relative z-10 max-w-xl mx-auto w-full"
        >
          {/* Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-primary rounded-t-[20px] border-b-[3px] border-black" />
          
          <div className="mt-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl xl:text-7xl font-display uppercase tracking-wide mb-2"
            >
              Your Name
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-sans font-bold text-primary mb-8"
            >
              Frontend & UI/UX Developer
            </motion.h2>

            <div className="space-y-4 font-sans font-bold text-gray-700 text-lg">
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
                transition={{ delay: 0.5 }}
              >
                Studying design & code — obsessed with details.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-black bg-yellow-200 inline-block px-3 py-1 rounded-lg border-2 border-black -rotate-1"
              >
                Place the towers to learn more.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-[60%] flex flex-col justify-end bg-[#F4F9FF] relative border-l-0 lg:border-l-[3px] border-black h-[600px] lg:h-auto">
        <GameBoard />
      </div>
    </section>
  );
}
