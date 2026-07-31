import { Badge } from "@/components/ui/badge";
import { ExternalLink, Gamepad2 } from "lucide-react";
import { LockedSection } from "@/components/locked-section";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const PROJECTS = [
  {
    id: 1,
    title: "ArrowKopo",
    description: "Featured project placeholder for ArrowKopo. Add the final case-study summary here.",
    tags: ["React", "UI", "Motion"],
    color: "project-channel-blue",
  },
  {
    id: 2,
    title: "ELife",
    description: "Featured project placeholder for ELife. Add the final project details here.",
    tags: ["TypeScript", "Tools", "UX"],
    color: "project-channel-green",
  },
  {
    id: 3,
    title: "Parity",
    description: "Featured project placeholder for Parity. Add the final product story here.",
    tags: ["Design", "Frontend", "Polish"],
    color: "project-channel-yellow",
  },
];

const TILE_STEP = 118;
const LOOP_WIDTH = PROJECTS.length * TILE_STEP;
const MIDDLE_REPEAT = 3;
const TRACK_START = MIDDLE_REPEAT * LOOP_WIDTH + 52;
const HOLD_MS = 1700;
const SWAP_MS = 560;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function ProjectsSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [trackX, setTrackX] = useState(0);
  const channelRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const targetIndexRef = useRef(0);
  const phaseRef = useRef<{
    mode: "hold" | "swap";
    start: number;
    from: number;
    to: number;
  } | null>(null);
  const selectedIndexRef = useRef(0);
  const dragRef = useRef<{ x: number; offset: number } | null>(null);
  const repeatedProjects = useMemo(
    () => Array.from({ length: 7 }, (_, repeat) => PROJECTS.map((project) => ({ ...project, repeat }))).flat(),
    [],
  );
  const selectedProject = PROJECTS[selectedIndex];

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaX || event.deltaY;
      offsetRef.current = positiveModulo(offsetRef.current + delta * 0.55, LOOP_WIDTH);
      velocityRef.current = Math.min(1.3, Math.max(-1.3, velocityRef.current + delta * 0.004));
      phaseRef.current = null;
    };

    channel.addEventListener("wheel", handleWheel, { passive: false });
    return () => channel.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (time: number) => {
      const delta = Math.min(48, time - previousTime);
      previousTime = time;

      if (dragRef.current) {
        phaseRef.current = null;
      } else if (Math.abs(velocityRef.current) > 0.01) {
        offsetRef.current = positiveModulo(offsetRef.current + velocityRef.current * delta, LOOP_WIDTH);
        velocityRef.current *= 0.88;
        phaseRef.current = null;
      } else {
        velocityRef.current = 0;
        let phase = phaseRef.current;

        if (!phase) {
          const nearestIndex = Math.round(offsetRef.current / TILE_STEP) % PROJECTS.length;
          targetIndexRef.current = nearestIndex;
          const snapped = nearestIndex * TILE_STEP;
          phase = {
            mode: Math.abs(offsetRef.current - snapped) > 0.5 ? "swap" : "hold",
            start: time,
            from: offsetRef.current,
            to: snapped,
          };
          phaseRef.current = phase;
        }

        const duration = phase.mode === "hold" ? HOLD_MS : SWAP_MS;
        const progress = Math.min(1, (time - phase.start) / duration);

        if (phase.mode === "swap") {
          offsetRef.current = phase.from + (phase.to - phase.from) * easeInOutCubic(progress);
        }

        if (progress >= 1) {
          if (phase.mode === "hold") {
            const from = targetIndexRef.current * TILE_STEP;
            const nextIndex = targetIndexRef.current + 1;
            targetIndexRef.current = nextIndex;
            phaseRef.current = {
              mode: "swap",
              start: time,
              from,
              to: nextIndex * TILE_STEP,
            };
          } else {
            offsetRef.current = positiveModulo(phase.to, LOOP_WIDTH);
            targetIndexRef.current = Math.round(offsetRef.current / TILE_STEP) % PROJECTS.length;
            phaseRef.current = {
              mode: "hold",
              start: time,
              from: offsetRef.current,
              to: offsetRef.current,
            };
          }
        }
      }

      const nextTrackX = offsetRef.current;
      const nextIndex = Math.round(positiveModulo(offsetRef.current, LOOP_WIDTH) / TILE_STEP) % PROJECTS.length;
      setTrackX(nextTrackX);

      if (nextIndex !== selectedIndexRef.current) {
        selectedIndexRef.current = nextIndex;
        setSelectedIndex(nextIndex);
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, offset: offsetRef.current };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const delta = drag.x - event.clientX;
    offsetRef.current = positiveModulo(drag.offset + delta, LOOP_WIDTH);
    velocityRef.current = Math.min(1.1, Math.max(-1.1, delta * 0.006));
    phaseRef.current = null;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <LockedSection unlockKey="frontend" title="Projects / Case Studies" towerName="Frontend Tower">
      <section id="projects" className="relative z-30 mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-center gap-4">
          <h2 className="text-4xl uppercase tracking-wider md:text-5xl">
            Featured Projects
          </h2>
          <div className="h-1 flex-1 rounded-full bg-black" />
        </div>

        <div className="project-console">
          <div key={selectedProject.id} className={cn("project-preview", selectedProject.color)}>
            <div className="project-preview-image">
              <Gamepad2 size={54} strokeWidth={2.5} />
              <span>Project Image</span>
            </div>
            <div className="project-preview-copy">
              <h3>{selectedProject.title}</h3>
              <p>{selectedProject.description}</p>
              <div className="project-preview-tags">
                {selectedProject.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <a href="#" onClick={(event) => event.preventDefault()}>
                View Project
                <ExternalLink size={16} strokeWidth={3} />
              </a>
            </div>
          </div>

          <div
            ref={channelRef}
            className="project-channel-viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="project-channel-selector" aria-hidden="true">
              <span className="project-selector-spin">
                <span className="project-selector-corner project-selector-corner-tl" />
                <span className="project-selector-corner project-selector-corner-tr" />
                <span className="project-selector-corner project-selector-corner-bl" />
                <span className="project-selector-corner project-selector-corner-br" />
              </span>
            </div>
            <div
              className="project-channel-track"
              style={{ transform: `translate3d(-${TRACK_START + trackX}px, 0, 0)` }}
            >
              {repeatedProjects.map((project) => (
                <button
                  key={`${project.repeat}-${project.id}`}
                  type="button"
                  className={cn("project-channel-tile", project.color)}
                  onClick={() => {
                    offsetRef.current = project.id - 1 === selectedIndex ? offsetRef.current : (project.id - 1) * TILE_STEP;
                    velocityRef.current = 0;
                    targetIndexRef.current = project.id - 1;
                    phaseRef.current = {
                      mode: "hold",
                      start: performance.now(),
                      from: offsetRef.current,
                      to: offsetRef.current,
                    };
                  }}
                  aria-label={`Select ${project.title}`}
                >
                  <span className="project-channel-image">
                    <Gamepad2 size={26} strokeWidth={2.5} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LockedSection>
  );
}
