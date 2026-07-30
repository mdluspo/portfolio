import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { LockedSection } from "@/components/locked-section";
import { cn } from "@/lib/utils";

const PROJECTS = [
  {
    id: 1,
    title: "Project Name",
    description: "Project description trulala trulala.",
    tags: ["React", "UI", "Motion"],
    color: "bg-blue-100",
  },
  {
    id: 2,
    title: "Project Name",
    description: "Project description trulala trulala.",
    tags: ["TypeScript", "Tools", "UX"],
    color: "bg-green-100",
  },
  {
    id: 3,
    title: "Project Name",
    description: "Project description trulala trulala.",
    tags: ["Design", "Frontend", "Polish"],
    color: "bg-yellow-100",
  },
];

export function ProjectsSection() {
  return (
    <LockedSection unlockKey="frontend" title="Projects / Case Studies" towerName="Frontend Tower">
      <section id="projects" className="relative z-30 mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-center gap-4">
          <h2 className="text-4xl uppercase tracking-wider md:text-5xl">
            Featured Projects
          </h2>
          <div className="h-1 flex-1 rounded-full bg-black" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              className="h-full overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-[6px_6px_0_0_#000] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className={cn("border-b-[3px] border-black p-6", project.color)}>
                <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border-2 border-dashed border-black/20 bg-white/55">
                  <span className="font-display text-base uppercase text-black/40">Project Image</span>
                </div>
              </div>

              <div className="flex min-h-[165px] flex-col px-6 py-5">
                <h3 className="mb-2 text-2xl">{project.title}</h3>
                <p className="mb-4 flex-1 font-sans font-medium leading-snug text-gray-700">
                  {project.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>

                <div className="mt-auto border-t-[3px] border-dashed border-black pt-3">
                  <a
                    href="#"
                    onClick={(event) => event.preventDefault()}
                    className="group inline-flex items-center gap-2 font-display text-sm font-bold uppercase transition-colors hover:text-primary"
                  >
                    View Project
                    <ExternalLink size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </LockedSection>
  );
}
