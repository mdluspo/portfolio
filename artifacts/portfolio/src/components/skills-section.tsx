import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Component,
  RotateCcw,
  Wrench,
} from "lucide-react";
import {
  SiClaudecode,
  SiFramer,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiReacthookform,
  SiShadcnui,
  SiTanstack,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiZod,
} from "react-icons/si";
import { LockedSection } from "@/components/locked-section";
import { cn } from "@/lib/utils";

const SKILL_TREES = [
  {
    title: "Languages",
    icon: Code,
    color: "#5eb3ff",
    text: "Core web languages for structure, interaction, styling, and type-safe implementation.",
    skills: ["TypeScript", "JavaScript", "HTML5", "CSS3"],
  },
  {
    title: "Frameworks & Runtime",
    icon: Component,
    color: "#22c55e",
    text: "Application foundations, rendering patterns, and JavaScript runtime work.",
    skills: ["React", "Next.js", "Node.js"],
  },
  {
    title: "UI & Styling",
    icon: Component,
    color: "#ff5c8a",
    text: "Component systems, styling primitives, and motion libraries for polished interfaces.",
    skills: ["Tailwind CSS", "shadcn/ui", "Motion"],
  },
  {
    title: "Data & Forms",
    icon: Wrench,
    color: "#14b8a6",
    text: "Client data flow, async state, forms, schemas, and validation.",
    skills: ["TanStack Query", "React Hook Form", "Zod"],
  },
  {
    title: "AI Workflow",
    icon: Wrench,
    color: "#a78bfa",
    text: "AI coding assistants and model tools used for faster iteration and implementation.",
    skills: ["Codex", "Claude Code"],
  },
  {
    title: "Version & Deploy",
    icon: SiGit,
    color: "#ff8a4c",
    text: "Source control, collaboration, build tooling, previews, and production publishing.",
    skills: ["Git", "GitHub", "Vercel"],
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

function CodexLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12.3 3.2c2.6-1.2 5.6.3 6.1 3.1 2.4.8 3.6 3.6 2.5 5.9 1.1 2.4-.3 5.2-2.9 5.8-1.1 2.4-4 3.4-6.2 2.1-2.4 1.1-5.2-.2-6-2.7-2.6-.6-4.1-3.3-3.2-5.8-1-2.5.4-5.2 3-5.8.7-2.5 3.8-3.8 6.7-2.6Z"
        fill="currentColor"
      />
      <path
        d="m8.2 8.2 2.5 3.2-2.5 3.2"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 15.1h3.8"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CSS3Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M5.1 3.5h13.8l-1.3 14.7L12 20.5l-5.6-2.3L5.1 3.5Z"
        fill="currentColor"
      />
      <path
        d="M12 18.3 15.6 17l0.9-10.9H12v12.2Z"
        fill="white"
        opacity="0.22"
      />
      <text
        x="12"
        y="15.8"
        fill="white"
        textAnchor="middle"
        fontSize="11"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
      >
        3
      </text>
    </svg>
  );
}

const SKILL_DETAILS: Record<string, { logo?: ElementType<{ className?: string }>; initials: string; info: string }> = {
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
    info: "Semantic structure, accessibility, and resilient page foundations.",
  },
  CSS3: {
    logo: CSS3Logo,
    initials: "C3",
    info: "Responsive styling, layout systems, animation details, and visual polish.",
  },
  "Tailwind CSS": {
    logo: SiTailwindcss,
    initials: "TW",
    info: "Utility-first styling, responsive layouts, tokens, and consistent interface polish.",
  },
  "shadcn/ui": {
    logo: SiShadcnui,
    initials: "SC",
    info: "Composable React UI primitives styled with Tailwind and adapted to each product.",
  },
  Motion: {
    logo: SiFramer,
    initials: "Mo",
    info: "Animation library for transitions, layout motion, and tactile interaction states.",
  },
  "Next.js": {
    logo: SiNextdotjs,
    initials: "Nx",
    info: "React app structure, routing patterns, and production-minded frontend setup.",
  },
  "Node.js": {
    logo: SiNodedotjs,
    initials: "Nd",
    info: "JavaScript runtime for APIs, tooling, scripts, and full-stack app foundations.",
  },
  Codex: {
    logo: CodexLogo,
    initials: "Cx",
    info: "OpenAI-powered coding support, debugging, implementation planning, and iteration.",
  },
  Git: {
    logo: SiGit,
    initials: "Gt",
    info: "Version control, branching, cleanup, and keeping changes easy to review.",
  },
  GitHub: {
    logo: SiGithub,
    initials: "GH",
    info: "Remote repositories, collaboration, pull requests, and project history.",
  },
  Vercel: {
    logo: SiVercel,
    initials: "Vc",
    info: "Frontend deployment, previews, and quick production publishing.",
  },
  "TanStack Query": {
    logo: SiTanstack,
    initials: "TQ",
    info: "Server-state fetching, caching, synchronization, and async UI patterns.",
  },
  "React Hook Form": {
    logo: SiReacthookform,
    initials: "HF",
    info: "Performant form state, validation wiring, controlled inputs, and submission flows.",
  },
  Zod: {
    logo: SiZod,
    initials: "Zd",
    info: "Runtime schemas, validation, and type-safe data parsing.",
  },
  "Claude Code": {
    logo: SiClaudecode,
    initials: "CC",
    info: "AI-assisted implementation, repo navigation, and iterative code changes.",
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

const CATEGORY_SIDE_LABELS: Partial<Record<SkillKey["category"], { label: string; className?: string }>> = {
  Languages: { label: "Languages", className: "skills-side-label-medium" },
  "Frameworks & Runtime": { label: "Frameworks", className: "skills-side-label-frameworks" },
  "UI & Styling": { label: "UI Styling", className: "skills-side-label-medium" },
  "Data & Forms": { label: "Data Forms", className: "skills-side-label-long" },
  "AI Workflow": { label: "AI Workflow", className: "skills-side-label-ai" },
  "Version & Deploy": { label: "Deployment", className: "skills-side-label-long" },
};

function SkillLogo({ skill }: { skill: SkillKey }) {
  const Logo = skill.logo;

  if (Logo) {
    return (
      <Logo
        className={cn(
          "h-7 w-7 drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]",
          skill.name === "Codex" && "h-8 w-8",
        )}
      />
    );
  }

  return <span className="text-base font-black leading-none tracking-normal">{skill.initials}</span>;
}

export function SkillsSection() {
  const [activeSkill, setActiveSkill] = useState<SkillKey>(SKILL_KEYS[0]);
  const [keyboardView, setKeyboardView] = useState({ scale: 1, rotateX: 24, rotateY: 0 });
  const keyboardRef = useRef<HTMLDivElement | null>(null);
  const keyboardViewRef = useRef(keyboardView);
  const rotateDragRef = useRef<{
    x: number;
    y: number;
    rotateX: number;
    rotateY: number;
  } | null>(null);

  useEffect(() => {
    keyboardViewRef.current = keyboardView;
  }, [keyboardView]);

  useEffect(() => {
    const keyboard = keyboardRef.current;
    if (!keyboard) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setKeyboardView((current) => {
        if (event.buttons === 1) {
          return {
            ...current,
            rotateX: Math.min(50, Math.max(-12, current.rotateX + event.deltaY * 0.035)),
          };
        }

        return {
          ...current,
          scale: Math.min(1.18, Math.max(0.72, current.scale - event.deltaY * 0.0012)),
        };
      });
    };

    keyboard.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      keyboard.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleKeyboardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    rotateDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: keyboardViewRef.current.rotateX,
      rotateY: keyboardViewRef.current.rotateY,
    };
  };

  const handleKeyboardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = rotateDragRef.current;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    setKeyboardView((current) => ({
      ...current,
      rotateX: Math.min(50, Math.max(-12, start.rotateX - dy * 0.16)),
      rotateY: Math.min(22, Math.max(-22, start.rotateY + dx * 0.14)),
    }));
  };

  const handleKeyboardPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    rotateDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <LockedSection unlockKey="techstack" title="Skills & Tech Stack" towerName="Tech Stack Tower">
      <section id="techstack" className="section-soft-entry py-24 px-4 md:px-8 bg-[#f7fbff] relative z-10 overflow-hidden">
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
              <button
                type="button"
                className="skills-keyboard-reset"
                aria-label="Reset keyboard view"
                onClick={() => setKeyboardView({ scale: 1, rotateX: 24, rotateY: 0 })}
              >
                <RotateCcw className="h-5 w-5" strokeWidth={3} />
              </button>
              <motion.div
                initial={{ opacity: 0, rotateX: 24, y: 84, scale: 0.94 }}
                whileInView={{
                  opacity: 1,
                  rotateX: keyboardView.rotateX,
                  rotateY: keyboardView.rotateY,
                  y: 0,
                  scale: keyboardView.scale,
                }}
                animate={{
                  rotateX: keyboardView.rotateX,
                  rotateY: keyboardView.rotateY,
                  scale: keyboardView.scale,
                }}
                viewport={{ once: true, amount: 0.32, margin: "-80px" }}
                ref={keyboardRef}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
                onPointerDown={handleKeyboardPointerDown}
                onPointerMove={handleKeyboardPointerMove}
                onPointerUp={handleKeyboardPointerUp}
                onPointerCancel={handleKeyboardPointerUp}
                className="skills-keyboard-deck"
              >
                <div className="skills-keyboard-base" />
                <div className="skills-deck-copy skills-deck-copy-main">
                  <strong>Skills</strong>
                </div>
                <div className="skills-deck-copy skills-deck-copy-side">
                  <strong className={CATEGORY_SIDE_LABELS[activeSkill.category]?.className}>
                    {CATEGORY_SIDE_LABELS[activeSkill.category]?.label ?? activeSkill.category}
                  </strong>
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
                      <motion.span
                        className="skill-key-cap"
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
