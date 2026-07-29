import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { LockedSection } from "@/components/locked-section";

export function ContactSection() {
  return (
    <LockedSection unlockKey="signal" title="Contact & Socials" towerName="Signal Tower">
      <section className="py-32 px-4 md:px-8 max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-primary border-cartoon shadow-[8px_8px_0_0_#000] rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
          {/* Striped overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 12px)"
            }}
          />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display uppercase tracking-wide mb-6">
              Send a Signal
            </h2>
            
            <p className="font-sans font-bold text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
              Always open to collabs, internships, and interesting problems. Let's build the next great interface together.
            </p>

            <div className="inline-block bg-white border-cartoon shadow-cartoon rounded-2xl p-4 md:p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <a 
                href="mailto:hello@alex.dev" 
                className="text-2xl md:text-4xl font-display font-bold hover:text-primary transition-colors block mb-8"
              >
                hello@alex.dev
              </a>

              <div className="flex justify-center gap-4">
                <a href="#" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <Github size={24} strokeWidth={2.5} />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-colors">
                  <Linkedin size={24} strokeWidth={2.5} />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl border-cartoon bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <Twitter size={24} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </LockedSection>
  );
}
