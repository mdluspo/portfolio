import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, Code, Wrench } from "lucide-react";

const SKILL_TREES = [
  {
    title: "Design",
    icon: Paintbrush,
    color: "bg-pink-200",
    skills: ["Figma", "UI/UX Research", "Wireframing", "Prototyping", "Design Systems", "Typography"]
  },
  {
    title: "Code",
    icon: Code,
    color: "bg-blue-200",
    skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3 / Tailwind", "Framer Motion", "Next.js"]
  },
  {
    title: "Tools",
    icon: Wrench,
    color: "bg-orange-200",
    skills: ["Git", "VS Code", "Vite", "Webpack", "Vercel", "npm/yarn"]
  }
];

export function SkillsSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-black/5 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-1 flex-1 bg-black rounded-full" />
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider text-center">
            Arsenal
          </h2>
          <div className="h-1 flex-1 bg-black rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SKILL_TREES.map((tree, i) => (
            <motion.div
              key={tree.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-cartoon shadow-cartoon rounded-3xl p-6 relative overflow-hidden"
            >
              {/* Decorative background shape */}
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 ${tree.color}`} />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={`w-12 h-12 rounded-xl border-[3px] border-black flex items-center justify-center ${tree.color}`}>
                  <tree.icon size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-display uppercase">{tree.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2 relative z-10">
                {tree.skills.map((skill) => (
                  <Badge key={skill} className="text-sm py-1 px-3 border-[2.5px] hover:bg-gray-100 transition-colors cursor-default">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
