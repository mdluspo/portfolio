import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
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

type GameId = "doom" | "bounce" | "diamond";

const GAMES: Array<{
  id: GameId;
  title: string;
  meta: string;
  status: string;
  src: string;
  accent: string;
  label: string;
  thumbnail: string;
  controls: string[];
}> = [
  {
    id: "doom",
    title: "DOOM II",
    meta: "FPS / WAD / 1994",
    status: "READY",
    src: "/games/doom/doom.html?v=6",
    accent: "bg-[#ffcf33]",
    label: "DII",
    thumbnail: "/doom.jpg",
    controls: ["Drag circle: move", "Fire: shoot", "Run: hold run", "Use: doors / switches", "Menu: pause menu", "No jump in classic Doom"],
  },
  {
    id: "bounce",
    title: "Bounce Classic",
    meta: "J2ME / JAR / Nokia",
    status: "READY",
    src: "/games/j2me-web/run.html?app=bounce&mobile=1&fractionScale=1&v=11",
    accent: "bg-[#ff6b6b]",
    label: "BOU",
    thumbnail: "/bounce.jpg",
    controls: ["Left pad: arrows / movement", "Right pad: number actions", "5 / OK: select", "L / R: soft keys", "Full: toggle integer scaling"],
  },
  {
    id: "diamond",
    title: "Diamond Rush",
    meta: "J2ME / JAR / K790",
    status: "READY",
    src: "/games/j2me-web/run.html?app=diamond&mobile=1&fractionScale=1&v=11",
    accent: "bg-[#70e1c8]",
    label: "DR",
    thumbnail: "/diamond_rush.jpg",
    controls: ["Left pad: arrows / movement", "Right pad: number actions", "5 / OK: select", "Esc: back", "Full: toggle integer scaling"],
  },
];

export function DesignProcessSection() {
  const [isGameWindowOpen, setIsGameWindowOpen] = useState(false);
  const [isGameWindowMinimized, setIsGameWindowMinimized] = useState(false);
  const [isGameWindowFullscreen, setIsGameWindowFullscreen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [gameSessionId, setGameSessionId] = useState(0);
  const [showGameControls, setShowGameControls] = useState(false);
  const gameWindowRef = useRef<HTMLDivElement | null>(null);
  const gameFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [gameWindowPosition, setGameWindowPosition] = useState<{ left: number; top: number } | null>(null);
  const [gameWindowDrag, setGameWindowDrag] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);
  const canUsePortal = typeof document !== "undefined";
  const selectedGame = GAMES.find((game) => game.id === activeGame);
  const selectedGameSrc = selectedGame
    ? `${import.meta.env.BASE_URL.replace(/\/$/, "")}${selectedGame.src}`
    : "";
  const isJ2meGame = selectedGame?.id === "bounce" || selectedGame?.id === "diamond";
  const isBounceGame = selectedGame?.id === "bounce";

  useEffect(() => {
    if (!isGameWindowOpen) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isGameWindowOpen]);

  const startGameWindowDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isGameWindowFullscreen) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    const rect = gameWindowRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    if (!gameWindowPosition) {
      setGameWindowPosition({ left: rect.left, top: rect.top });
    }
    setGameWindowDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: gameWindowPosition?.left ?? rect.left,
      originTop: gameWindowPosition?.top ?? rect.top,
    });
  };

  const moveGameWindowDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!gameWindowDrag || gameWindowDrag.pointerId !== event.pointerId) return;

    const width = gameWindowRef.current?.offsetWidth ?? 320;
    const height = gameWindowRef.current?.offsetHeight ?? 80;
    const nextLeft = gameWindowDrag.originLeft + event.clientX - gameWindowDrag.startX;
    const nextTop = gameWindowDrag.originTop + event.clientY - gameWindowDrag.startY;

    setGameWindowPosition({
      left: Math.min(window.innerWidth - 48, Math.max(16 - width, nextLeft)),
      top: Math.min(window.innerHeight - 48, Math.max(16, nextTop)),
    });
  };

  const stopGameWindowDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setGameWindowDrag(null);
  };

  const issuerLogo = (issuer: string) => {
    if (issuer === "Anthropic") return "/anthropic.png";
    if (issuer === "LinkedIn") return "/linkedin.png";
    if (issuer === "Cisco") return "/cisco.png";
    if (issuer.startsWith("Certiport")) return "/certiport.png";
    return "/dict.png";
  };

  return (
    <LockedSection unlockKey="uiux" title="About Me" towerName="About Me Unit">
      <section id="about" className="section-soft-entry py-24 px-4 md:px-8 bg-white relative z-10">
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
            className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start"
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

            <div className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-4">
              <div className="relative w-full aspect-[4/5] rounded-2xl border-[3px] border-black bg-primary/15 shadow-[6px_6px_0_0_#000] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_0,white_18%,transparent_19%),linear-gradient(135deg,hsl(208_61%_88%),white)]" />
              </div>

              <button
                type="button"
                onClick={() => setIsGameWindowOpen(true)}
                className="border-cartoon bg-secondary px-7 py-3 rounded-lg font-display text-base font-black uppercase shadow-cartoon transition-transform hover:-translate-y-1"
              >
                Press Me
              </button>
            </div>
          </motion.div>

          {isGameWindowOpen &&
            canUsePortal &&
            createPortal(
              <div className={`fixed inset-0 z-[2147483647] isolate bg-black/80 ${isGameWindowFullscreen ? "p-0" : "p-2 sm:p-4"}`}>
                <motion.div
                  ref={gameWindowRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex flex-col overflow-hidden border-[3px] border-black bg-black shadow-[8px_8px_0_0_#000] ${
                    isGameWindowFullscreen
                      ? "h-[100dvh] w-[100vw] max-w-none"
                      : isGameWindowMinimized
                        ? "h-auto w-[calc(100vw-1rem)] max-w-md sm:w-full"
                        : isBounceGame
                          ? "h-[82dvh] w-[calc(100vw-1rem)] max-w-[640px] sm:h-[76vh] sm:w-[min(96vw,640px)]"
                          : isJ2meGame
                            ? "h-[88dvh] w-[calc(100vw-1rem)] max-w-[760px] sm:h-[92vh] sm:w-[min(96vw,760px)]"
                            : "h-[82dvh] w-[calc(100vw-1rem)] max-w-5xl sm:w-full"
                  }`}
                  style={
                    isGameWindowFullscreen
                      ? {
                          position: "absolute",
                          left: 0,
                          top: 0,
                        }
                      : {
                          position: "absolute",
                          left: gameWindowPosition?.left ?? "50%",
                          top: gameWindowPosition?.top ?? "50%",
                          translate: gameWindowPosition ? undefined : "-50% -50%",
                        }
                  }
                >
                  <div
                    onPointerDown={startGameWindowDrag}
                    onPointerMove={moveGameWindowDrag}
                    onPointerUp={stopGameWindowDrag}
                    onPointerCancel={stopGameWindowDrag}
                    className="flex min-h-[72px] shrink-0 cursor-move flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-secondary px-3 py-3 sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      {activeGame && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGame(null);
                            setShowGameControls(false);
                            setGameSessionId((current) => current + 1);
                          }}
                          className="border-[2px] border-black bg-white px-1.5 py-1 font-display text-[9px] font-black uppercase shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:px-2 sm:text-[10px]"
                        >
                          Back
                        </button>
                      )}
                      <span className="truncate font-display text-xs font-black uppercase tracking-widest sm:text-sm">
                        {selectedGame?.title ?? "GAMES.EXE"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {selectedGame && !isGameWindowMinimized && (
                        <button
                          type="button"
                          aria-label="Show game controls"
                          onClick={() => setShowGameControls((current) => !current)}
                          className="border-[2px] border-black bg-white px-1.5 py-1 font-display text-[9px] font-black uppercase shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:px-2 sm:text-[10px]"
                        >
                          Controls
                        </button>
                      )}
                      {selectedGame && !isGameWindowMinimized && (
                        <button
                          type="button"
                          aria-label="Resume game"
                          onClick={() => {
                            gameFrameRef.current?.contentWindow?.postMessage("resume-game", "*");
                            gameFrameRef.current?.contentWindow?.focus();
                            gameFrameRef.current?.focus();
                          }}
                          className="border-[2px] border-black bg-white px-1.5 py-1 font-display text-[9px] font-black uppercase shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:px-2 sm:text-[10px]"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Minimize game window"
                        onClick={() => setIsGameWindowMinimized((current) => !current)}
                        className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-white font-display text-lg font-black leading-none shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:h-8 sm:w-8"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        aria-label="Toggle fullscreen game window"
                        onClick={() => {
                          setIsGameWindowFullscreen((current) => !current);
                          setIsGameWindowMinimized(false);
                        }}
                        className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-white font-display text-sm font-black leading-none shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:h-8 sm:w-8"
                      >
                        {isGameWindowFullscreen ? "[]" : "[ ]"}
                      </button>
                      <button
                        type="button"
                        aria-label="Close game window"
                        onClick={() => {
                          setIsGameWindowOpen(false);
                          setIsGameWindowMinimized(false);
                          setIsGameWindowFullscreen(false);
                          setActiveGame(null);
                          setShowGameControls(false);
                          setGameWindowPosition(null);
                          setGameWindowDrag(null);
                          setGameSessionId((current) => current + 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-white font-display text-sm font-black leading-none shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 sm:h-8 sm:w-8"
                      >
                        X
                      </button>
                    </div>
                  </div>
                  {!isGameWindowMinimized && (
                    selectedGame ? (
                      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                        <iframe
                          ref={gameFrameRef}
                          title={selectedGame.title}
                          src={selectedGameSrc}
                          key={`${selectedGame.id}-${gameSessionId}`}
                          className="block h-full w-full border-0"
                          allow="fullscreen; gamepad"
                        />

                        {showGameControls && (
                          <div className="absolute right-2 top-2 z-10 w-[min(16rem,calc(100%-1rem))] border-[3px] border-black bg-white p-3 shadow-[5px_5px_0_0_#000] sm:right-4 sm:top-4 sm:p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <h3 className="font-display text-lg font-black uppercase leading-none">
                                Controls
                              </h3>
                              <button
                                type="button"
                                onClick={() => setShowGameControls(false)}
                                className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-secondary font-display text-xs font-black shadow-[2px_2px_0_0_#000]"
                              >
                                X
                              </button>
                            </div>
                            <ul className="space-y-2">
                              {selectedGame.controls.map((control) => (
                                <li
                                  key={control}
                                  className="border-b-2 border-black pb-1 font-sans text-sm font-black"
                                >
                                  {control}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex min-h-0 flex-1 flex-col bg-white">
                        <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
                          <div className="grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
                            {GAMES.map((game) => (
                              <button
                                key={game.id}
                                type="button"
                                onClick={() => {
                                  setActiveGame(game.id);
                                  setShowGameControls(false);
                                  setGameWindowPosition(null);
                                  setGameWindowDrag(null);
                                  setGameSessionId((current) => current + 1);
                                }}
                                className="group border-[3px] border-black bg-white p-3 text-left shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-1"
                              >
                                <div className={`mb-3 flex aspect-[16/10] items-center justify-center overflow-hidden border-[3px] border-black ${game.accent}`}>
                                  <img
                                    src={game.thumbnail}
                                    alt={`${game.title} thumbnail`}
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                  />
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="font-display text-2xl font-black uppercase leading-none">
                                      {game.title}
                                    </h3>
                                    <p className="mt-1 font-sans text-xs font-black uppercase text-gray-500">
                                      {game.meta}
                                    </p>
                                  </div>
                                  <span className="border-[2px] border-black bg-secondary px-2 py-1 font-display text-[10px] font-black uppercase">
                                    {game.status}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    )
                  )}
                </motion.div>
              </div>,
              document.body,
            )}

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
