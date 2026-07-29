import { motion } from "framer-motion";
import { LockedSection } from "@/components/locked-section";

export function DesignProcessSection() {
  return (
    <LockedSection unlockKey="uiux" title="About Me" towerName="About Me Unit">
      <section id="about" className="py-24 px-4 md:px-8 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider">
              About Me
            </h2>
            <div className="h-1 flex-1 bg-black rounded-full" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-center"
          >
            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-sans font-bold leading-relaxed text-gray-800">
                I like building interfaces that feel good to use, especially fun.
              </p>
              <p className="text-lg md:text-xl font-sans font-semibold leading-relaxed text-gray-700">
                I care a lot about making interfaces feel complete. From spacing, motion, layout, flow, and whether someone can figure out what to do without fighting the page. I am into frontend and UI/UX because it sits right between design and code, and that is pretty much the part that I enjoy most.
              </p>
              <p className="text-lg md:text-xl font-sans font-semibold leading-relaxed text-gray-700">
                I use tools like React, TypeScript, Tailwind, and design systems, but my real goal is simple: make things clean, usable, and alive.
              </p>
              <p className="text-lg md:text-xl font-sans font-semibold leading-relaxed text-gray-700">
                I am interested in internships, collaborations, and projects where I can keep improving as a frontend/UI/UX developer and build things that actually feel intentional.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[320px] aspect-[4/5] rounded-3xl border-[3px] border-black bg-primary/15 shadow-[8px_8px_0_0_#000] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_0,white_18%,transparent_19%),linear-gradient(135deg,hsl(208_61%_88%),white)]" />
            </div>
          </motion.div>
        </div>
      </section>
    </LockedSection>
  );
}
