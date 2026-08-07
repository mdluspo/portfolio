import { motion } from "framer-motion";
import { Github, Instagram, Linkedin } from "lucide-react";
import { LockedSection } from "@/components/locked-section";

export function ContactSection() {
  return (
    <LockedSection unlockKey="signal" title="Contact & Socials" towerName="Signal Tower">
      <section id="contact" className="section-soft-entry relative z-10 mx-auto max-w-4xl px-4 py-20 md:px-8 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="border-cartoon relative overflow-hidden rounded-3xl bg-primary p-5 text-center shadow-[5px_5px_0_0_#000] sm:p-8 md:p-16 md:shadow-[8px_8px_0_0_#000]"
        >
          {/* Striped overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 12px)"
            }}
          />

          <div className="relative z-10">
            <h2 className="mb-5 font-display text-4xl uppercase tracking-wide md:mb-6 md:text-6xl">
              Send a Signal
            </h2>
            
            <p className="mx-auto mb-8 max-w-xl font-sans text-base font-bold leading-relaxed sm:text-lg md:mb-12 md:text-xl">
              Always open to collabs, internships, and interesting problems. Let's build the next great interface together.
            </p>

            <div className="border-cartoon inline-block w-full max-w-full rotate-1 rounded-2xl bg-white p-4 shadow-cartoon transition-transform duration-300 hover:rotate-0 md:w-auto md:p-8">
              <a 
                href="mailto:mdluspo122604@gmail.com" 
                className="mb-8 block break-all font-display text-lg font-bold leading-tight transition-colors hover:text-primary sm:text-2xl md:text-4xl"
              >
                mdluspo122604@gmail.com
              </a>

              <div className="flex justify-center gap-4">
                <a href="https://github.com/mdluspo" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <Github size={24} strokeWidth={2.5} />
                </a>
                <a href="https://www.linkedin.com/in/martin-luspo/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-colors">
                  <Linkedin size={24} strokeWidth={2.5} />
                </a>
                <a href="https://www.instagram.com/mdluspo/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <Instagram size={24} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </LockedSection>
  );
}
