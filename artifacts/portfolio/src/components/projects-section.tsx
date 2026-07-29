import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { LockedSection } from "@/components/locked-section";

const PROJECTS = [
  {
    id: 1,
    title: "LootBox UI",
    description: "A playful, high-performance UI kit for game menus. Built with React and Framer Motion to make standard web components feel like juicy game elements.",
    tags: ["React", "Framer Motion", "Tailwind"],
    color: "bg-blue-100",
  },
  {
    id: 2,
    title: "Quest Log Dashboard",
    description: "A task management tool reimagined as an RPG quest log. Features drag-and-drop prioritization and experience point progression.",
    tags: ["TypeScript", "Zustand", "CSS Modules"],
    color: "bg-green-100",
  },
  {
    id: 3,
    title: "Arcade Portfolio",
    description: "An experimental webGL portfolio experience featuring classic arcade aesthetics mixed with modern web typography.",
    tags: ["Three.js", "React Three Fiber", "GLSL"],
    color: "bg-yellow-100",
  }
];

export function ProjectsSection() {
  return (
    <LockedSection unlockKey="frontend" title="Projects / Case Studies" towerName="Frontend Tower">
      <section id="projects" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider">
            Deployed Units
          </h2>
          <div className="h-1 flex-1 bg-black rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#5B9BD5]">
                <div className={`h-32 -mx-6 -mt-6 mb-6 rounded-t-xl border-b-[3px] border-black flex items-center justify-center p-6 ${project.color}`}>
                   <div className="w-full h-full bg-white/50 rounded-lg border-2 border-dashed border-black/20 flex items-center justify-center">
                      <span className="font-display text-black/40 text-lg uppercase">Visual Asset</span>
                   </div>
                </div>
                
                <h3 className="text-2xl font-display mb-3">{project.title}</h3>
                <p className="font-sans font-medium text-gray-700 mb-6 flex-1">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>

                <div className="pt-4 border-t-[3px] border-black border-dashed mt-auto">
                  <a href="#" className="inline-flex items-center gap-2 font-display uppercase text-sm font-bold hover:text-primary transition-colors group">
                    View Project 
                    <ExternalLink size={16} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </LockedSection>
  );
}
