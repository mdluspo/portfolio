import React from "react";

export type EnemyType = {
  id: string;
  kind: "drone" | "bug" | "boss";
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  progress?: number;
  dragged?: boolean;
  thrown?: boolean;
  vx?: number;
  vy?: number;
  opacity?: number;
};

const imageMap: Record<string, string[]> = {
  // prefer the user-provided images (assumed in public/)
  drone: ["/plane.png", "/plane%20.png", "/assets/plane.png", "/deadline-drone.png"],
  bug: ["/bug.png", "/bug%20.png", "/assets/bug.png", "/bug-byte.png"],
  boss: ["/blob.png", "/blob%20.png", "/assets/blob.png", "/boss-blob.png"],
};

function ImgFallback({ candidates, alt }: { candidates: string[]; alt: string }) {
  return <img src={candidates[0]} alt={alt} className="w-full h-full object-contain p-1" />;
}

export const Enemy = React.memo(function Enemy({
  enemy,
  onPointerDown,
}: {
  enemy: EnemyType;
  onPointerDown?: (e: React.PointerEvent, enemy: EnemyType) => void;
}) {
  const size = enemy.kind === "boss" ? 96 : 56;

  return (
    <div
      className="absolute left-0 top-0 z-30 cursor-grab touch-none active:cursor-grabbing"
      style={{
        opacity: enemy.opacity ?? 1,
        transform: `translate3d(${enemy.x}px, ${enemy.y}px, 0) translate(-50%, -50%)`,
        transition: "opacity 760ms ease",
        willChange: "transform, opacity",
      }}
      onPointerDown={(e) => onPointerDown?.(e, enemy)}
    >
      <div className="flex flex-col items-center">
        <div style={{ width: size, height: size }} className="rounded-full bg-white border-2 border-black flex items-center justify-center overflow-hidden shadow-[2px_2px_0_0_#000]">
          <ImgFallback candidates={imageMap[enemy.kind]} alt={enemy.kind} />
        </div>
        <div className="mt-2 h-2 w-20 rounded-full border border-black bg-white overflow-hidden">
          <div
            className={enemy.kind === "boss" ? "h-full bg-red-400" : "h-full bg-primary"}
            style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
          />
        </div>
        <div className="mt-1 w-28 text-[11px] font-bold text-gray-500 text-center">
          {enemy.kind === "boss" ? "BOSS" : enemy.kind === "drone" ? "PLANE" : "BUG"}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  const a = prev.enemy;
  const b = next.enemy;
  return (
    a.id === b.id &&
    a.kind === b.kind &&
    a.x === b.x &&
    a.y === b.y &&
    a.hp === b.hp &&
    a.maxHp === b.maxHp &&
    a.progress === b.progress &&
    a.dragged === b.dragged &&
    a.thrown === b.thrown &&
    a.vx === b.vx &&
    a.vy === b.vy &&
    a.opacity === b.opacity
  );
});

export default Enemy;
