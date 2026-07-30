import { useState } from "react";
import type { CSSProperties, ElementType } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Component,
  MousePointerClick,
  Paintbrush,
  PencilRuler,
  Search,
  Wrench,
} from "lucide-react";
import {
  SiClaudecode,
  SiCursor,
  SiFigma,
  SiFramer,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { LockedSection } from "@/components/locked-section";

const SKILL_TREES = [
  {
    title: "Design",
    icon: Paintbrush,
    color: "#ff5c8a",
    text: "Research, systems, and prototypes that make interfaces easier to aim.",
    skills: ["Figma", "UI/UX Research", "Wireframing", "Prototyping", "Design Systems"],
  },
  {
    title: "Code",
    icon: Code,
    color: "#5eb3ff",
    text: "Frontend builds with motion, type-safety, and clean reusable components.",
    skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3 / Tailwind", "Framer Motion", "Next.js"],
  },
  {
    title: "Tools",
    icon: Wrench,
    color: "#ffb020",
    text: "The setup, deployment, and AI coding tools that keep the workflow fast.",
    skills: ["Git", "VS Code", "Vite", "Vercel", "Claude Code", "Cursor"],
  },
];

type SkillKey = {
  name: string;
  category: (typeof SKILL_TREES)[number]["title"];
  categoryText: string;
  categoryColor: string;
  color: string;
  logo?: ElementType<{ className?: string }>;
  initials: string;
  info: string;
};

const SKILL_DETAILS: Record<string, { logo?: ElementType<{ className?: string }>; initials: string; info: string }> = {
  Figma: {
    logo: SiFigma,
    initials: "Fg",
    info: "Layout, components, variants, and handoff-ready interface files.",
  },
  "UI/UX Research": {
    logo: Search,
    initials: "UX",
    info: "User flows, interface audits, personas, and decisions backed by behavior.",
  },
  Wireframing: {
    logo: PencilRuler,
    initials: "WF",
    info: "Fast page structure, information hierarchy, and clickable low-fidelity screens.",
  },
  Prototyping: {
    logo: MousePointerClick,
    initials: "PT",
    info: "Interactive flows that test motion, transitions, and product feel before build.",
  },
  "Design Systems": {
    logo: Component,
    initials: "DS",
    info: "Reusable styles, tokens, and component rules for consistent UI work.",
  },
  React: {
    logo: SiReact,
    initials: "Rx",
    info: "Component-driven interfaces, hooks, state, and reusable frontend patterns.",
  },
  TypeScript: {
    logo: SiTypescript,
    initials: "TS",
    info: "Typed data, safer props, and cleaner contracts between UI pieces.",
  },
  JavaScript: {
    logo: SiJavascript,
    initials: "JS",
    info: "Core browser logic, interaction state, and polished client-side behavior.",
  },
  HTML5: {
    logo: SiHtml5,
    initials: "H5",
    info: "Semantic markup, structure, accessibility, and resilient page foundations.",
  },
  "CSS3 / Tailwind": {
    logo: SiTailwindcss,
    initials: "TW",
    info: "Responsive layouts, animation polish, utility systems, and custom visual language.",
  },
  "Framer Motion": {
    logo: SiFramer,
    initials: "FM",
    info: "Expressive hover states, transitions, reveals, and tactile UI motion.",
  },
  "Next.js": {
    logo: SiNextdotjs,
    initials: "Nx",
    info: "React app structure, routing patterns, and production-minded frontend setup.",
  },
  Git: {
    logo: SiGit,
    initials: "Gt",
    info: "Version control, branching, cleanup, and keeping changes easy to review.",
  },
  "VS Code": {
    logo: VscVscode,
    initials: "VS",
    info: "Editor workflow, extensions, debugging, and fast project navigation.",
  },
  Vite: {
    logo: SiVite,
    initials: "Vi",
    info: "Fast local development, HMR, and lean frontend build tooling.",
  },
  Vercel: {
    logo: SiVercel,
    initials: "Vc",
    info: "Frontend deployment, previews, and quick production publishing.",
  },
  "Claude Code": {
    logo: SiClaudecode,
    initials: "CC",
    info: "AI-assisted implementation, repo navigation, and iterative code changes.",
  },
  Cursor: {
    logo: SiCursor,
    initials: "Cu",
    info: "AI-native editor workflows for quick experiments and project edits.",
  },
};

const DECORATIVE_KEYS = [
  { className: "key-f4", label: "F4" },
  { className: "key-prt", label: "Prt" },
  { className: "key-ins", label: "Ins" },
  { className: "key-home", label: "Home" },
  { className: "key-pgup", label: "Pg" },
  { className: "key-del", label: "Del" },
  { className: "key-end", label: "End" },
  { className: "key-pgdn", label: "Pg" },
  { className: "key-up", label: "↑" },
  { className: "key-left", label: "←" },
  { className: "key-down", label: "↓" },
  { className: "key-right", label: "→" },
  { className: "key-n0", label: "0" },
  { className: "key-n1", label: "1" },
  { className: "key-n2", label: "2" },
  { className: "key-n3", label: "3" },
];

const SKILL_KEYS: SkillKey[] = SKILL_TREES.flatMap((tree) =>
  tree.skills.map((name, index) => ({
    name,
    category: tree.title,
    categoryText: tree.text,
    categoryColor: tree.color,
    color: tree.color,
    ...(SKILL_DETAILS[name] ?? {
      initials: name
        .split(/\s|\/|-|\./)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2),
      info: "A practical part of the build arsenal.",
    }),
  })),
);

function SkillLogo({ skill }: { skill: SkillKey }) {
  const Logo = skill.logo;

  if (Logo) {
    return <Logo className="h-7 w-7 drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]" />;
  }

  return <span className="text-base font-black leading-none tracking-normal">{skill.initials}</span>;
}

export function SkillsSection() {
  const [activeSkill, setActiveSkill] = useState<SkillKey>(SKILL_KEYS[0]);

  return (
    <LockedSection unlockKey="techstack" title="Skills & Tech Stack" towerName="Tech Stack Tower">
      <section id="techstack" className="py-24 px-4 md:px-8 bg-[#f7fbff] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-1 flex-1 bg-black rounded-full" />
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider text-center">
              Arsenal
            </h2>
            <div className="h-1 flex-1 bg-black rounded-full" />
          </div>

          <div className="skills-arsenal-stage">
            <motion.div
              key={activeSkill.name}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="skills-floating-copy"
            >
              <h3>
                {activeSkill.name}
              </h3>
              <span>{activeSkill.info}</span>
            </motion.div>

            <div className="skills-keyboard-scene" aria-label="Interactive skills keyboard">
              <motion.div
                initial={{ opacity: 0, rotateX: 24, y: 84, scale: 0.94 }}
                whileInView={{ opacity: 1, rotateX: 24, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.32, margin: "-80px" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                drag
                dragSnapToOrigin
                dragElastic={0.08}
                dragMomentum={false}
                className="skills-keyboard-deck"
              >
                <div className="skills-keyboard-base" />
                <div className="skills-deck-copy skills-deck-copy-main">
                  <strong>Skills</strong>
                </div>
                <div className="skills-deck-copy skills-deck-copy-side">
                  <strong>{activeSkill.category}</strong>
                </div>
                <div className="skills-key-grid">
                  {SKILL_KEYS.map((skill) => (
                    <button
                      key={skill.name}
                      type="button"
                      className="skill-key"
                      style={{ "--key-color": skill.color } as CSSProperties}
                      aria-label={`${skill.name}: ${skill.info}`}
                      onMouseEnter={() => setActiveSkill(skill)}
                      onFocus={() => setActiveSkill(skill)}
                    >
                      <span className="skill-key-hole" />
                      <motion.span
                        className="skill-key-cap"
                        drag
                        dragSnapToOrigin
                        dragElastic={0.2}
                        dragMomentum={false}
                        whileHover={{ y: -9, z: 12 }}
                        whileFocus={{ y: -9, z: 12 }}
                        whileTap={{ y: -5, scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          damping: 18,
                        }}
                      >
                        <span className="skill-key-top">
                          <SkillLogo skill={skill} />
                        </span>
                        <span className="skill-key-front" />
                        <span className="skill-key-side" />
                      </motion.span>
                      <span className="sr-only">{skill.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </LockedSection>
  );
}
