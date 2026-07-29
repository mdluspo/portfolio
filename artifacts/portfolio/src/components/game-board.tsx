import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UNITS } from "@/lib/gameData";
import type { TowerKey } from "@/lib/gameData";
import { useUnlockState } from "@/lib/unlockState";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DeployedTower = {
  key: TowerKey;
  left: string;
  top: string;
};

// Sub-component so Icon is a proper capitalized local variable
function PlacedTower({
  unit,
  meMessage,
  isDragging,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  unit: (typeof UNITS)[number];
  meMessage: string | null;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) {
  const Icon = unit.icon;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "relative group flex flex-col items-center cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0"
      )}
    >
      <motion.div
        key="placed"
        initial={{ scale: 0, rotate: -8, y: 12 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex flex-col items-center"
      >
      {/* Chat bubble — only for the "Me" unit once placed */}
      {unit.key === "me" && meMessage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-3 w-40 bg-white border-[2.5px] border-black px-3 py-2 rounded-xl shadow-[3px_3px_0_0_#000] text-[11px] leading-tight font-sans font-bold text-center z-30"
        >
          {meMessage}
          <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[2.5px] border-r-[2.5px] border-black rotate-45" />
        </motion.div>
      )}

      {/* Tower body */}
      <div
        className={cn(
          "w-16 h-20 rounded-xl border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0_0_#000] bg-white",
          unit.color
        )}
      >
        <Icon size={36} className="text-black" />
      </div>

      {/* Name tag */}
      <div className="mt-2 whitespace-nowrap bg-white border-[2px] border-black px-2 py-0.5 rounded-lg text-[10px] font-display font-bold shadow-[1px_1px_0_0_#000]">
        {unit.name}
      </div>

      {/* Remove on hover */}
      <button
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-7 h-7 bg-destructive text-white border-[2px] border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-20"
      >
        <X size={14} strokeWidth={3} />
      </button>
      </motion.div>
    </div>
  );
}

export function GameBoard() {
  const { placed, place, remove } = useUnlockState();
  const [deployedTowers, setDeployedTowers] = useState<Partial<Record<TowerKey, DeployedTower>>>({});
  const [draggingKey, setDraggingKey] = useState<TowerKey | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const dragKey = useRef<TowerKey | null>(null);

  const onDragStart = (e: React.DragEvent, key: TowerKey) => {
    dragKey.current = key;
    e.dataTransfer.setData("text/plain", key);
    const rect = e.currentTarget.getBoundingClientRect();
    const dragPreview = e.currentTarget.cloneNode(true) as HTMLElement;
    dragPreview.style.position = "fixed";
    dragPreview.style.top = "-1000px";
    dragPreview.style.left = "-1000px";
    dragPreview.style.opacity = "1";
    dragPreview.style.pointerEvents = "none";
    dragPreview.style.transform = "none";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(
      dragPreview,
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
    window.setTimeout(() => dragPreview.remove(), 0);
    window.requestAnimationFrame(() => setDraggingKey(key));
  };

  const onDragEnd = () => {
    dragKey.current = null;
    setDraggingKey(null);
  };

  const onSceneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onSceneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const key = dragKey.current;
    if (!key) return;

    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = ((e.clientX - rect.left) / rect.width) * 100;
    const top = ((e.clientY - rect.top) / rect.height) * 100;

    setDeployedTowers(prev => ({
      ...prev,
      [key]: {
        key,
        left: `${Math.min(96, Math.max(4, left))}%`,
        top: `${Math.min(82, Math.max(12, top))}%`,
      },
    }));
    if (!placed.has(key)) place(key);
    onDragEnd();
  };

  const onTowerDrop = (e: React.DragEvent<HTMLDivElement>, replacedKey: TowerKey) => {
    e.preventDefault();
    const key = dragKey.current;
    if (!key) return;
    if (key === replacedKey) {
      onSceneDrop(e);
      return;
    }
    e.stopPropagation();

    const target = deployedTowers[replacedKey];
    if (!target) return;

    setDeployedTowers(prev => {
      const next = { ...prev };
      delete next[replacedKey];
      next[key] = {
        key,
        left: target.left,
        top: target.top,
      };
      return next;
    });
    remove(replacedKey);
    if (!placed.has(key)) place(key);
    onDragEnd();
  };

  const handleRemove = (e: React.MouseEvent, key: TowerKey) => {
    e.stopPropagation();
    setDeployedTowers(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    remove(key);
  };

  const mePlaced = placed.has("me");
  const allOthers = (["uiux", "frontend", "techstack", "signal"] as TowerKey[]).every(k => placed.has(k));
  const meMessage = allOthers
    ? "You've unlocked everything — scroll down to explore!"
    : mePlaced
    ? "Deploy units to unlock portfolio sections."
    : "Hi! Drag the towers onto their spots beside the road. Each one reveals a section of my portfolio.";

  return (
    <div className="absolute inset-0 select-none bg-white">
      {/* SCENE */}
      <div
        className="absolute inset-0 overflow-hidden bg-white"
        ref={sceneRef}
        onDragOver={onSceneDragOver}
        onDrop={onSceneDrop}
      >
        {/* Road SVG — S-curve from bottom-left toward right, matching sketch */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Outer blue band */}
          <path
            d="M 300,635 C 435,575 520,565 620,515 C 735,458 745,405 865,355 C 990,303 1080,275 1180,190"
            fill="none"
            stroke="hsl(208 61% 88%)"
            strokeWidth="90"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* White road surface */}
          <path
            d="M 300,635 C 435,575 520,565 620,515 C 735,458 745,405 865,355 C 990,303 1080,275 1180,190"
            fill="none"
            stroke="white"
            strokeWidth="62"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Centre dashes */}
          <path
            d="M 300,635 C 435,575 520,565 620,515 C 735,458 745,405 865,355 C 990,303 1080,275 1180,190"
            fill="none"
            stroke="hsl(208 61% 82%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="16 18"
          />
        </svg>

        <AnimatePresence>
          {Object.values(deployedTowers)
            .filter((tower): tower is DeployedTower => Boolean(tower))
            .map((tower) => {
            const unit = UNITS.find(u => u.key === tower.key) ?? null;
            if (!unit) return null;
            return (
            <div
              key={tower.key}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{ left: tower.left, top: tower.top }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onTowerDrop(e, tower.key)}
            >
              <PlacedTower
                unit={unit}
                meMessage={unit.key === "me" ? meMessage : null}
                isDragging={draggingKey === unit.key}
                onDragStart={(e) => onDragStart(e, unit.key)}
                onDragEnd={onDragEnd}
                onRemove={(e) => handleRemove(e, unit.key)}
              />
            </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* HORIZONTAL TRAY */}
      <div className="absolute bottom-5 left-1/2 z-20 w-full -translate-x-1/2 bg-transparent px-3 py-3">
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
                draggable={!isPlaced}
                onDragStart={(e) => { if (!isPlaced) onDragStart(e, unit.key); }}
                onDragEnd={onDragEnd}
                className={cn(
                  "flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-[2.5px] border-black bg-white text-center transition-all duration-150",
                  isPlaced
                    ? "opacity-40 grayscale cursor-not-allowed"
                    : "cursor-grab active:cursor-grabbing hover:-translate-y-1 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center shrink-0", unit.color)}>
                  <Icon size={20} className="text-black" />
                </div>
                <div className="w-full px-1">
                  <div className="font-display font-bold text-[11px] leading-[1.05]">{unit.name}</div>
                  <div className="hidden">
                    {unit.key === "me" ? "→ Instructions" : unit.unlocks ? `→ ${unit.unlocks}` : ""}
                  </div>
                </div>
                {isPlaced && (
                  <span className="hidden">
                    Placed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
