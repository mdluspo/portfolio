import { motion } from "framer-motion";
import { LockedSection } from "@/components/locked-section";

const CERTIFICATIONS = [
  {
    title: "AI Fluency for Builders",
    issuer: "Anthropic",
    issued: "Jul 2026",
    credentialId: "emzspfaz84u2",
  },
  {
    title: "Claude Code 101",
    issuer: "Anthropic",
    issued: "Jul 2026",
    credentialId: "kr76fisssr7a",
  },
  {
    title: "AI Fluency Framework & Foundations",
    issuer: "Anthropic",
    issued: "Jul 2026",
    credentialId: "brzrkafk438v",
  },
  {
    title: "Learning MATLAB",
    issuer: "LinkedIn",
    issued: "Nov 2025",
  },
  {
    title: "Complete Guide to Android Development with Kotlin for Beginners",
    issuer: "LinkedIn",
    issued: "Nov 2025",
  },
  {
    title: "Using Git with Visual Studio Code",
    issuer: "LinkedIn",
    issued: "Oct 2025",
  },
  {
    title: "CCNA: Introduction to Networks",
    issuer: "Cisco",
    issued: "Aug 2025",
  },
  {
    title: "IT Specialist - Python",
    issuer: "Certiport - A Pearson VUE Business",
    issued: "Jul 2025",
    credentialId: "13d6bcf9-57c5-4341-a213-8224a97201ea",
  },
  {
    title: "Advanced Level of Software Engineering",
    issuer: "Department of Information and Communications Technology - Philippines",
    issued: "Dec 2024",
    credentialId: "3899f9fc-7259-9cea-7aeac3476370",
  },
  {
    title: "Intermediate Level of Software Engineering",
    issuer: "Department of Information and Communications Technology - Philippines",
    issued: "Dec 2024",
    credentialId: "17e8758d-c9e4-4204-804c-f7345592b4ed",
  },
  {
    title: "Basic Level of Software Engineering",
    issuer: "Department of Information and Communications Technology - Philippines",
    issued: "Dec 2024",
    credentialId: "096181f8-be15-4f33-9f14-73ea261fa78c",
  },
];

export function DesignProcessSection() {
  const issuerLogo = (issuer: string) => {
    if (issuer === "Anthropic") return "/anthropic.png";
    if (issuer === "LinkedIn") return "/linkedin.png";
    if (issuer === "Cisco") return "/cisco.png";
    if (issuer.startsWith("Certiport")) return "/certiport.png";
    return "/dict.png";
  };

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

          <div className="mt-16">
            <div className="mb-6 flex items-center gap-4">
              <h3 className="text-3xl font-display uppercase tracking-wider">
                Certifications
              </h3>
              <div className="h-1 flex-1 rounded-full bg-black" />
            </div>

            <div className="cert-marquee -mx-4 overflow-hidden px-4 py-1">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className={`cert-marquee-row ${row === 1 ? "cert-marquee-row-slow" : ""}`}
                >
                  {[...CERTIFICATIONS, ...CERTIFICATIONS].map((cert, index) => (
                    <div
                      key={`${row}-${index}-${cert.title}-${cert.issuer}`}
                      className="group flex min-h-[130px] w-[300px] shrink-0 flex-col rounded-xl border-[3px] border-black bg-white p-3.5 shadow-[4px_4px_0_0_#000] transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="mb-2.5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white font-display text-sm font-black shadow-[2px_2px_0_0_#000]">
                          <img
                            src={issuerLogo(cert.issuer)}
                            alt=""
                            className="h-6 w-6 object-contain"
                            draggable={false}
                          />
                        </div>
                        <p className="min-w-0 truncate font-sans text-xs font-black uppercase tracking-wide text-gray-500">
                          {cert.issuer}
                        </p>
                      </div>
                      <h4 className="mb-2 text-[17px] font-display leading-tight">{cert.title}</h4>
                      <p className="mt-auto break-all font-sans text-[10.5px] font-bold text-gray-400">
                        Issued {cert.issued}
                        {cert.credentialId ? ` | ID ${cert.credentialId}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LockedSection>
  );
}
