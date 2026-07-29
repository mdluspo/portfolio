import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { UNITS } from "@/lib/gameData";
import type { TowerKey } from "@/lib/gameData";
import { useUnlockState } from "@/lib/unlockState";
import { cn } from "@/lib/utils";

type DeployedTower = {
  key: TowerKey;
  x: number;
  y: number;
};

type DragState = {
  key: TowerKey;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

const SECTION_ME_MESSAGES = [
  { id: "about", message: "Oh hey, it's me." },
  { id: "projects", message: "These are the things I've deployed." },
  { id: "techstack", message: "This is what I use to build." },
  { id: "contact", message: "You found the signal. Say hi." },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TowerVisual({
  unit,
  meMessage,
  isPreview = false,
  onRemove,
}: {
  unit: (typeof UNITS)[number];
  meMessage?: string | null;
  isPreview?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
}) {
  const Icon = unit.icon;

  return (
    <div className="relative group flex flex-col items-center">
      {unit.key === "me" && meMessage && !isPreview && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-3 w-40 bg-white border-[2.5px] border-black px-3 py-2 rounded-xl shadow-[3px_3px_0_0_#000] text-[11px] leading-tight font-sans font-bold text-center z-30"
        >
          {meMessage}
          <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[2.5px] border-r-[2.5px] border-black rotate-45" />
        </motion.div>
      )}

      <div
        className={cn(
          "w-16 h-20 rounded-xl border-[2.5px] border-black flex items-center justify-center bg-white",
          isPreview ? "shadow-[5px_5px_0_0_#000]" : "shadow-[3px_3px_0_0_#000]",
          unit.color,
        )}
      >
        <Icon size={34} className="text-black" />
      </div>

      <div className="mt-2 whitespace-nowrap bg-white border-[2px] border-black px-2 py-0.5 rounded-lg text-[10px] font-display font-bold shadow-[1px_1px_0_0_#000]">
        {unit.name}
      </div>

      {onRemove && !isPreview && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="absolute -top-3 -right-3 w-7 h-7 bg-destructive text-white border-[2px] border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-20"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

export function GameBoard() {
  const { placed, place, remove } = useUnlockState();
  const [deployedTowers, setDeployedTowers] = useState<Partial<Record<TowerKey, DeployedTower>>>({});
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDeployedTowers((prev) => {
      let changed = false;
      const next = { ...prev };

      (Object.keys(next) as TowerKey[]).forEach((key) => {
        if (placed.has(key)) return;
        delete next[key];
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [placed]);

  useEffect(() => {
    const syncScroll = () => setScrollY(window.scrollY);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  useEffect(() => {
    const defaults: Partial<Record<TowerKey, DeployedTower>> = {
      me: { key: "me", x: window.innerWidth * 0.46, y: window.innerHeight * 0.48 },
      uiux: { key: "uiux", x: window.innerWidth * 0.58, y: window.innerHeight * 0.38 },
      frontend: { key: "frontend", x: window.innerWidth * 0.70, y: window.innerHeight * 0.32 },
      techstack: { key: "techstack", x: window.innerWidth * 0.80, y: window.innerHeight * 0.42 },
      signal: { key: "signal", x: window.innerWidth * 0.72, y: window.innerHeight * 0.45 },
    };

    setDeployedTowers((prev) => {
      let changed = false;
      const next = { ...prev };

      (Object.keys(defaults) as TowerKey[]).forEach((key) => {
        if (!placed.has(key) || next[key]) return;
        next[key] = defaults[key];
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [deployedTowers, placed]);

  const startDrag = (e: React.PointerEvent, key: TowerKey) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({
      key,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      setDragging((current) =>
        current ? { ...current, x: e.clientX, y: e.clientY } : current,
      );
    };

    const onUp = (e: PointerEvent) => {
      const pageWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

      const deployed = Object.values(deployedTowers).filter(
        (tower): tower is DeployedTower => Boolean(tower),
      );
      const replacementTarget = deployed.find((tower) => {
        if (tower.key === dragging.key) return false;
        const towerX = tower.x;
        const towerY = tower.y - window.scrollY;
        return Math.abs(e.clientX - towerX) < 70 && Math.abs(e.clientY - towerY) < 95;
      });

      if (replacementTarget) {
        setDeployedTowers((prev) => {
          const next = { ...prev };
          delete next[replacementTarget.key];
          next[dragging.key] = {
            key: dragging.key,
            x: replacementTarget.x,
            y: replacementTarget.y,
          };
          return next;
        });
        remove(replacementTarget.key);
      } else {
        setDeployedTowers((prev) => ({
          ...prev,
          [dragging.key]: {
            key: dragging.key,
            x: clamp(e.clientX, 40, pageWidth - 40),
            y: clamp(e.clientY + window.scrollY, 80, pageHeight - 80),
          },
        }));
      }

      if (!placed.has(dragging.key)) place(dragging.key);
      setDragging(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [deployedTowers, dragging, place, placed, remove]);

  const handleRemove = (e: React.MouseEvent, key: TowerKey) => {
    e.stopPropagation();
    setDeployedTowers((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    remove(key);
  };

  const mePlaced = placed.has("me");
  const allOthers = (["uiux", "frontend", "techstack", "signal"] as TowerKey[]).every((k) =>
    placed.has(k),
  );
  const getMeMessage = () => {
    const meTower = deployedTowers.me;
    if (meTower) {
      const sectionMessage = SECTION_ME_MESSAGES.find(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = rect.bottom + window.scrollY;
        return meTower.y >= top && meTower.y <= bottom;
      });
      if (sectionMessage) return sectionMessage.message;
    }

    if (allOthers) return "You've unlocked everything - scroll down to explore!";
    if (mePlaced) return "Deploy units to unlock portfolio sections.";
    return "Hi! Drag the units anywhere on the board. Each one reveals a section of my portfolio.";
  };
  const meMessage = getMeMessage();
  const draggingUnit = dragging ? UNITS.find((unit) => unit.key === dragging.key) : null;

  return (
    <div className="absolute left-0 top-0 min-h-screen w-full select-none bg-white">
      <div ref={sceneRef} className="absolute left-0 top-0 h-screen w-full overflow-x-hidden overflow-y-visible bg-white">
        <svg
          viewBox="0 0 1200 600"
          className="absolute inset-y-0 -left-[8vw] h-full w-[128vw] pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="road-left-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0.08" />
              <stop offset="10%" stopColor="white" stopOpacity="0.35" />
              <stop offset="24%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <mask id="road-left-mask">
              <rect width="1200" height="600" fill="url(#road-left-fade)" />
            </mask>
          </defs>

          <g mask="url(#road-left-mask)">
            <path
              d="M 235,660 C 390,625 525,610 650,565 C 765,523 805,455 930,395 C 1045,340 1135,295 1240,190"
              fill="none"
              stroke="hsl(208 61% 88%)"
              strokeWidth="90"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 235,660 C 390,625 525,610 650,565 C 765,523 805,455 930,395 C 1045,340 1135,295 1240,190"
              fill="none"
              stroke="white"
              strokeWidth="62"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="road-dashes"
              d="M 235,660 C 390,625 525,610 650,565 C 765,523 805,455 930,395 C 1045,340 1135,295 1240,190"
              fill="none"
              stroke="hsl(208 61% 82%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="16 18"
            />
          </g>
        </svg>
      </div>

      <AnimatePresence>
        {Object.values(deployedTowers)
          .filter((tower): tower is DeployedTower => Boolean(tower))
          .map((tower) => {
            const unit = UNITS.find((u) => u.key === tower.key);
            if (!unit) return null;

            return (
              <motion.div
                key={tower.key}
                initial={{ scale: 0, rotate: -8, y: 12 }}
                animate={{
                  scale: dragging?.key === tower.key ? 0.98 : 1,
                  rotate: 0,
                  y: 0,
                  opacity: dragging?.key === tower.key ? 0 : 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="fixed z-40 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: tower.x, top: tower.y - scrollY }}
                onPointerDown={(e) => startDrag(e, unit.key)}
              >
                <TowerVisual
                  unit={unit}
                  meMessage={unit.key === "me" ? meMessage : null}
                  onRemove={(e) => handleRemove(e, unit.key)}
                />
              </motion.div>
            );
          })}
      </AnimatePresence>

      {dragging && draggingUnit && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: dragging.x - dragging.offsetX,
            top: dragging.y - dragging.offsetY,
          }}
        >
          <TowerVisual unit={draggingUnit} isPreview />
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 z-30 w-full -translate-x-1/2 bg-transparent px-3 py-3">
        <p className="text-center font-display text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Drag a unit anywhere
        </p>
        <div className="flex justify-center gap-2 overflow-x-auto pb-1">
          {UNITS.map((unit) => {
            const isPlaced = placed.has(unit.key);
            const Icon = unit.icon;
            return (
              <div
                key={unit.key}
                onPointerDown={(e) => {
                  if (!isPlaced) startDrag(e, unit.key);
                }}
                className={cn(
                  "flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-[2.5px] border-black bg-white text-center transition-all duration-150",
                  isPlaced
                    ? "opacity-40 grayscale cursor-not-allowed"
                    : "relative z-0 cursor-grab active:cursor-grabbing shadow-[2px_2px_0_0_#000] outline-none hover:-translate-y-1 hover:z-10 focus-visible:-translate-y-1",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center shrink-0",
                    unit.color,
                  )}
                >
                  <Icon size={20} className="text-black" />
                </div>
                <div className="w-full px-1">
                  <div className="font-display font-bold text-[11px] leading-[1.05]">{unit.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
