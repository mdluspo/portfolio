import { motion } from "framer-motion";
import { LockedSection } from "@/components/locked-section";

const STEPS = [
  { num: "01", title: "Discover", desc: "Understanding the problem, the people, and the goals." },
  { num: "02", title: "Define", desc: "Structuring the architecture and laying out the blueprints." },
  { num: "03", title: "Design", desc: "Crafting the visual language and interaction paradigms." },
  { num: "04", title: "Deliver", desc: "Building it robustly with code and shipping to production." },
];

export function DesignProcessSection() {
  return (
    <LockedSection unlockKey="uiux" title="Design Process" towerName="UI/UX Tower">
      <section className="py-24 px-4 md:px-8 bg-primary/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider">
              Design Process
            </h2>
            <div className="h-1 flex-1 bg-black rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-cartoon rounded-2xl p-6 shadow-cartoon hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="text-5xl font-display text-primary/30 mb-4">{step.num}</div>
                <h3 className="text-2xl font-display mb-2">{step.title}</h3>
                <p className="font-sans font-bold text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white border-cartoon rounded-3xl p-8 md:p-12 shadow-cartoon max-w-4xl mx-auto text-center"
          >
            <p className="text-xl md:text-2xl font-sans font-bold leading-relaxed text-gray-800">
              I'm a student developer deeply passionate about the intersection of design and engineering. I believe that great UI/UX comes from understanding people first, then crafting systems that feel inevitable — not just pretty.
            </p>
          </motion.div>
        </div>
      </section>
    </LockedSection>
  );
}
