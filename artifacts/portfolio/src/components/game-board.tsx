import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { UNITS } from "@/lib/gameData";
import type { TowerKey } from "@/lib/gameData";
import { useUnlockState } from "@/lib/unlockState";
import { cn } from "@/lib/utils";
import Enemy, { EnemyType } from "@/components/enemy";
import Bullet, { BulletType } from "@/components/bullet";

type DeployedTower = {
  key: TowerKey;
  x: number;
  y: number;
};

type AttackCue = {
  kind: string;
  ts: number;
  ammo: number;
  maxAmmo: number;
};

type DragState = {
  key: TowerKey;
  x: number;
  y: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  fromTray: boolean;
};

type EnemyDragState = {
  id: string;
  offsetX: number;
  offsetY: number;
  lastX: number;
  lastY: number;
  lastTs: number;
  vx: number;
  vy: number;
};

const SECTION_ME_MESSAGES = [
  { id: "about", message: "Oh hey, it's me." },
  { id: "projects", message: "These are the things I've deployed." },
  { id: "techstack", message: "This is what I use to build." },
  { id: "contact", message: "You found the signal. Say hi." },
];

const ROAD_SEGMENTS = [
  { p0: [235, 660], p1: [390, 625], p2: [525, 610], p3: [650, 565] },
  { p0: [650, 565], p1: [765, 523], p2: [805, 455], p3: [930, 395] },
  { p0: [930, 395], p1: [1045, 340], p2: [1135, 295], p3: [1240, 190] },
];
const ROAD_PATH_D =
  "M 235,660 C 390,625 525,610 650,565 C 765,523 805,455 930,395 C 1045,340 1135,295 1240,190";
const GAME_RENDER_FPS = 30;
const MAX_ACTIVE_ENEMIES = 14;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cubic(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const it = 1 - t;
  const x = it * it * it * p0[0] + 3 * it * it * t * p1[0] + 3 * it * t * t * p2[0] + t * t * t * p3[0];
  const y = it * it * it * p0[1] + 3 * it * it * t * p1[1] + 3 * it * t * t * p2[1] + t * t * t * p3[1];
  return { x, y };
}

function pointOnPath(s: number) {
  const segCount = ROAD_SEGMENTS.length;
  const clamped = Math.max(0, Math.min(1, s));
  const t = clamped * segCount;
  const idx = Math.min(Math.floor(t), segCount - 1);
  const localT = t - idx;
  const seg = ROAD_SEGMENTS[idx];
  return cubic(seg.p0, seg.p1, seg.p2, seg.p3, localT);
}

function pointOnScreenPath(s: number) {
  const pt = pointOnPath(s);
  const width = window.innerWidth || 1200;
  const height = window.innerHeight || 600;
  const svgLeft = width * -0.08;
  const svgWidth = width * 1.28;
  return {
    x: svgLeft + (pt.x / 1200) * svgWidth,
    y: (pt.y / 600) * height,
  };
}

function nearestRoadPoint(x: number, y: number) {
  let nearest = { s: 0, x: 0, y: 0, distance: Number.POSITIVE_INFINITY };

  for (let i = 0; i <= 72; i += 1) {
    const s = i / 72;
    const pt = pointOnScreenPath(s);
    const distance = Math.hypot(pt.x - x, pt.y - y);
    if (distance < nearest.distance) {
      nearest = { s, x: pt.x, y: pt.y, distance };
    }
  }

  return nearest;
}

function randomDeploymentPoint(pageScroll = window.scrollY) {
  const s = 0.28 + Math.random() * 0.46;
  const pt = pointOnScreenPath(s);
  const pageWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  const heroHeight = window.innerHeight || 600;
  const isCompact = window.innerWidth < 720;
  const offsetX = (Math.random() - 0.5) * 120;
  const aboveRoadOffset = 130 + Math.random() * 165;
  const minX = isCompact ? 72 : Math.min(pageWidth - 110, Math.max(420, pageWidth * 0.52));
  const maxX = isCompact ? Math.max(minX, pageWidth - 72) : Math.max(minX, pageWidth - 120);
  const minY = 115 + pageScroll;
  const maxY = pageScroll + heroHeight * (isCompact ? 0.62 : 0.57);

  return {
    x: clamp(pt.x + offsetX, minX, maxX),
    y: clamp(pt.y - aboveRoadOffset + pageScroll, minY, maxY),
  };
}

function heroEdgeOpacity(y: number) {
  const height = window.innerHeight || 600;
  const fadeStart = height - 190;
  const fadeEnd = height - 82;

  if (y <= fadeStart) return 1;
  return clamp(1 - (y - fadeStart) / (fadeEnd - fadeStart), 0, 1);
}

function towerAttackConfig(key: TowerKey) {
  switch (key) {
    case "frontend":
      return { maxAmmo: 3, cooldown: 0.72, reload: 0.9, blankReload: 0.22, speed: 620, range: 300, damage: 4 };
    case "uiux":
    case "me":
      return { maxAmmo: 4, cooldown: 0.58, reload: 0.86, blankReload: 0.18, speed: 560, range: 280, damage: 2 };
    case "techstack":
      return { maxAmmo: 3, cooldown: 0.78, reload: 0.95, blankReload: 0.22, speed: 500, range: 320, damage: 5 };
    case "signal":
      return { maxAmmo: 1, cooldown: 0.2, reload: 1.25, blankReload: 0.18, speed: 680, range: 360, damage: 8 };
  }
}

function bulletKindFor(key: TowerKey, ammoBeforeShot: number) {
  switch (key) {
    case "frontend":
      return ammoBeforeShot === 3 ? "token1" : ammoBeforeShot === 2 ? "token2" : "token3";
    case "techstack":
      return "disk";
    case "signal":
      return "signal";
    case "uiux":
      return "paint";
    case "me":
      return "none";
  }
}

function towerImageFor(key: TowerKey, ammo: number) {
  if (key === "me") {
    return "/full_luspo.png";
  }

  if (key === "techstack") {
    if (ammo >= 3) return "/layer.png";
    if (ammo === 2) return "/layer2.png";
    return "/layer3.png";
  }

  if (key === "uiux") {
    if (ammo >= 4) return "/pallete.png";
    if (ammo === 3) return "/pallete2.png";
    if (ammo === 2) return "/pallete3.png";
    return "/pallete4.png";
  }

  return null;
}

function bulletSpawnOffset(key: TowerKey, ammoBeforeShot: number) {
  if (key === "techstack") {
    return { x: 0, y: ammoBeforeShot === 3 ? -13 : ammoBeforeShot === 2 ? -5 : 4 };
  }

  if (key === "uiux" || key === "me") {
    const holes = [
      { x: 8, y: -13 },
      { x: 15, y: -2 },
      { x: 5, y: 10 },
      { x: -10, y: 5 },
    ];
    return holes[Math.max(0, Math.min(holes.length - 1, 4 - ammoBeforeShot))];
  }

  return { x: 0, y: 0 };
}

function bulletMuzzlePoint({
  key,
  towerX,
  towerY,
  targetX,
  targetY,
  ammoBeforeShot,
}: {
  key: TowerKey;
  towerX: number;
  towerY: number;
  targetX: number;
  targetY: number;
  ammoBeforeShot: number;
}) {
  const dx = targetX - towerX;
  const dy = targetY - towerY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const dirX = dx / distance;
  const dirY = dy / distance;
  const baseOffset = bulletSpawnOffset(key, ammoBeforeShot);

  if (key === "signal") {
    return {
      x: towerX + dirX * 24,
      y: towerY + dirY * 24,
      dirX,
      dirY,
      distance,
    };
  }

  return {
    x: towerX + baseOffset.x,
    y: towerY + baseOffset.y,
    dirX,
    dirY,
    distance,
  };
}

function TowerVisual({
  unit,
  meMessage,
  isPreview = false,
  onRemove,
  shot,
}: {
  unit: (typeof UNITS)[number];
  meMessage?: string | null;
  isPreview?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
  shot?: { kind?: string; ts?: number; ammo?: number; maxAmmo?: number } | null;
}) {
  const Icon = unit.icon;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const elapsed = shot && shot.ts ? Math.max(0, now - shot.ts) : 0;
  const config = towerAttackConfig(unit.key);
  const rawAmmo = shot?.ammo ?? config.maxAmmo;
  const maxAmmo = shot?.maxAmmo ?? config.maxAmmo;
  const isEmptyReloading = Boolean(shot && rawAmmo === 0 && elapsed < config.blankReload * 1000);
  const shouldShowSpentState = Boolean(shot && rawAmmo < maxAmmo && (rawAmmo > 0 || isEmptyReloading));
  const ammo = shouldShowSpentState ? rawAmmo : maxAmmo;
  const shouldBlankOnReload =
    (unit.key === "frontend" || unit.key === "techstack") && isEmptyReloading;
  const isShowingAmmoState = shouldShowSpentState;
  const shouldReplaceIcon =
    (unit.key === "frontend" || unit.key === "uiux") && isShowingAmmoState;
  const towerImage = towerImageFor(unit.key, ammo);
  const isShotPop = Boolean(shot && elapsed < 180);

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
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{
              opacity: shouldBlankOnReload ? 0 : 1,
              scale: shouldBlankOnReload ? 0.7 : isShotPop ? 1.12 : 1,
              rotate: unit.key === "signal" && isShotPop ? 10 : 0,
            }}
            transition={{ type: "spring", stiffness: 520, damping: 24, mass: 0.55 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {towerImage && (
              <img
                src={towerImage}
                alt=""
                className={cn(unit.key === "me" ? "h-[76px] w-[62px]" : "h-11 w-11", "object-contain")}
                draggable={false}
              />
            )}

            {!towerImage && !shouldReplaceIcon && unit.key !== "frontend" && (
              <Icon
                size={34}
                className="text-black"
              />
            )}

            {unit.key === "frontend" && !shouldReplaceIcon && (
              <div className="font-display text-2xl font-black leading-none">
                &lt;/&gt;
              </div>
            )}

            {unit.key === "frontend" && shouldReplaceIcon && (
              <div className="font-display text-2xl font-black leading-none">
                {ammo === 2 ? "/>" : ammo === 1 ? ">" : ""}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mt-2 whitespace-nowrap bg-white border-[2px] border-black px-2 py-0.5 rounded-lg text-[10px] font-display font-bold shadow-[1px_1px_0_0_#000]">
        {unit.name}
      </div>

      {onRemove && !isPreview && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="absolute -top-3 -right-3 w-7 h-7 bg-destructive text-white border-[2px] border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity outline-none hover:scale-110 focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white z-20"
          aria-label={`Remove ${unit.name}`}
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

type GameBoardProps = {
  autoDeployKey?: TowerKey | null;
};

export function GameBoard({ autoDeployKey }: GameBoardProps) {
  const { placed, place, remove } = useUnlockState();
  const [deployedTowers, setDeployedTowers] = useState<Partial<Record<TowerKey, DeployedTower>>>({});
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [draggingEnemy, setDraggingEnemy] = useState<EnemyDragState | null>(null);
  const draggingEnemyRef = useRef<EnemyDragState | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const dragPointerYRef = useRef(0);
  const dragAutoScrollRafRef = useRef<number | null>(null);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [bullets, setBullets] = useState<BulletType[]>([]);
  const [towerShots, setTowerShots] = useState<Partial<Record<TowerKey, AttackCue>>>({});
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const renderAccumulatorRef = useRef(0);
  const spawnRef = useRef(0);
  const enemiesRef = useRef<EnemyType[]>([]);
  const bulletsRef = useRef<BulletType[]>([]);
  const towersRef = useRef<Partial<Record<TowerKey, DeployedTower>>>({});
  const cooldownRef = useRef<Partial<Record<TowerKey, number>>>({});
  const ammoRef = useRef<Partial<Record<TowerKey, number>>>({});
  const previousPlacedRef = useRef<Set<TowerKey>>(new Set());

  const deployUnit = useCallback((key: TowerKey) => {
    if (placed.has(key)) return;
    const point = randomDeploymentPoint();
    setDeployedTowers((prev) => ({
      ...prev,
      [key]: {
        key,
        x: point.x,
        y: point.y,
      },
    }));
    place(key);
  }, [place, placed]);

  useEffect(() => {
    if (!autoDeployKey || deployedTowers[autoDeployKey]) return;

    const point = randomDeploymentPoint(0);
    setDeployedTowers((prev) => ({
      ...prev,
      [autoDeployKey]: {
        key: autoDeployKey,
        x: point.x,
        y: point.y,
      },
    }));
    if (!placed.has(autoDeployKey)) place(autoDeployKey);
  }, [autoDeployKey, deployedTowers, place, placed]);

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

    const newlyPlaced = Array.from(placed).filter((key) => !previousPlacedRef.current.has(key));
    if (newlyPlaced.length > 1) {
      setLiveMessage("All portfolio sections unlocked.");
    } else if (newlyPlaced.length === 1) {
      const unit = UNITS.find((item) => item.key === newlyPlaced[0]);
      setLiveMessage(`${unit?.unlocks || unit?.name || "Unit"} unlocked.`);
    }
    previousPlacedRef.current = new Set(placed);
  }, [placed]);

  useEffect(() => {
    const syncScroll = () => setScrollY(window.scrollY);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    towersRef.current = deployedTowers;
  }, [deployedTowers]);

  useEffect(() => {
    setDeployedTowers((prev) => {
      let changed = false;
      const next = { ...prev };

      UNITS.forEach(({ key }) => {
        if (!placed.has(key) || next[key]) return;
        next[key] = { key, ...randomDeploymentPoint(0) };
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [placed]);

  // spawn and animation loop (movement, bullets, collisions)
  useEffect(() => {
    function uid() {
      return Math.random().toString(36).slice(2, 9);
    }

    function step(ts: number) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min(100, ts - lastRef.current) / 1000;
      lastRef.current = ts;
      renderAccumulatorRef.current += dt;
      let nextEnemies = enemiesRef.current;

      // spawn enemies occasionally (place on path end so they follow the road)
      spawnRef.current += dt;
      const activeEnemyCount = nextEnemies.filter((enemy) => !enemy.thrown).length;
      if (spawnRef.current > 1.8 && activeEnemyCount < MAX_ACTIVE_ENEMIES) {
        spawnRef.current = 0;
        const kind: EnemyType["kind"] = Math.random() > 0.92 ? "boss" : Math.random() > 0.5 ? "drone" : "bug";
        const base = pointOnScreenPath(1);
        const spawn: EnemyType = {
          id: uid(),
          kind,
          x: base.x,
          y: base.y + (Math.random() * 12 - 6),
          hp: kind === "boss" ? 120 : kind === "drone" ? 18 : 12,
          maxHp: kind === "boss" ? 120 : kind === "drone" ? 18 : 12,
          progress: 1,
        };
        nextEnemies = [...nextEnemies, spawn];
        enemiesRef.current = nextEnemies;
      }

      // move enemies along the path (progress decreases from 1 -> 0)
      nextEnemies = nextEnemies
        .map((e) => {
          if (e.dragged) return e;
          if (e.thrown) {
            return {
              ...e,
              x: e.x + (e.vx ?? 0) * dt,
              y: e.y + (e.vy ?? 0) * dt,
              vx: (e.vx ?? 0) * 0.96,
              vy: (e.vy ?? 0) * 0.96 + 40 * dt,
              opacity: Math.max(0, (e.opacity ?? 1) - dt * 1.35),
            };
          }

          const speed = e.kind === "boss" ? 0.055 : e.kind === "drone" ? 0.18 : 0.12;
          const nextProg = (typeof e.progress === "number" ? e.progress : 1) - speed * dt;
          const pt = pointOnScreenPath(Math.max(0, Math.min(1, nextProg)));
          return { ...e, progress: nextProg, x: pt.x, y: pt.y } as EnemyType & { progress: number };
        })
        .filter((e) => {
          if (e.thrown) return (e.opacity ?? 1) > 0;
          return typeof e.progress === "number" ? e.progress > -0.05 : true;
        });
      enemiesRef.current = nextEnemies;

      const spawnedBullets: BulletType[] = [];
      const shotUpdates: Partial<Record<TowerKey, AttackCue>> = {};
      Object.values(towersRef.current).forEach((tower) => {
        if (!tower) return;
        if (tower.key === "me") return;
        cooldownRef.current[tower.key] = Math.max(0, (cooldownRef.current[tower.key] ?? 0) - dt);
        if ((cooldownRef.current[tower.key] ?? 0) > 0) return;

        const config = towerAttackConfig(tower.key);
        let ammoBeforeShot = ammoRef.current[tower.key] ?? config.maxAmmo;

        if (ammoBeforeShot <= 0) {
          ammoBeforeShot = config.maxAmmo;
          ammoRef.current[tower.key] = ammoBeforeShot;
          shotUpdates[tower.key] = {
            kind: "reload",
            ts,
            ammo: config.maxAmmo,
            maxAmmo: config.maxAmmo,
          };
        }

        const towerScreen = { x: tower.x, y: tower.y - window.scrollY - 12 };
        const target = nextEnemies
          .filter((enemy) => enemy.hp > 0)
          .map((enemy) => ({
            enemy,
            distance: Math.hypot(enemy.x - towerScreen.x, enemy.y - towerScreen.y),
          }))
          .filter(({ distance }) => distance <= config.range)
          .sort((a, b) => (a.enemy.progress ?? 0) - (b.enemy.progress ?? 0))[0]?.enemy;

        if (!target) return;

        const kind = bulletKindFor(tower.key, ammoBeforeShot);
        const nextAmmo = Math.max(0, ammoBeforeShot - 1);
        const muzzle = bulletMuzzlePoint({
          key: tower.key,
          towerX: towerScreen.x,
          towerY: towerScreen.y,
          targetX: target.x,
          targetY: target.y,
          ammoBeforeShot,
        });
        const refilledAmmo = nextAmmo === 0 ? config.maxAmmo : nextAmmo;
        ammoRef.current[tower.key] = refilledAmmo;
        spawnedBullets.push({
          id: uid(),
          x: muzzle.x,
          y: muzzle.y,
          vx: muzzle.dirX * config.speed,
          vy: muzzle.dirY * config.speed,
          damage: config.damage,
          kind,
          age: 0,
          originX: towerScreen.x,
          originY: towerScreen.y,
          targetId: target.id,
        });
        cooldownRef.current[tower.key] = nextAmmo === 0 ? config.reload : config.cooldown;
        shotUpdates[tower.key] = { kind, ts, ammo: nextAmmo, maxAmmo: config.maxAmmo };
      });

      if (spawnedBullets.length > 0) {
        bulletsRef.current = [...bulletsRef.current, ...spawnedBullets];
        setTowerShots((prev) => ({ ...prev, ...shotUpdates }));
      }

      const moved = bulletsRef.current
        .map((bullet) => {
          if (bullet.returning && typeof bullet.originX === "number" && typeof bullet.originY === "number") {
            const speed = Math.max(420, Math.hypot(bullet.vx, bullet.vy));
            const dx = bullet.originX - bullet.x;
            const dy = bullet.originY - bullet.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const desiredVx = (dx / distance) * speed;
            const desiredVy = (dy / distance) * speed;
            const turn = Math.min(1, dt * 5.2);
            const vx = bullet.vx + (desiredVx - bullet.vx) * turn;
            const vy = bullet.vy + (desiredVy - bullet.vy) * turn;
            return {
              ...bullet,
              vx,
              vy,
              x: bullet.x + vx * dt,
              y: bullet.y + vy * dt,
            };
          }

          return {
            ...bullet,
            age: (bullet.age ?? 0) + dt,
            x: bullet.x + bullet.vx * dt,
            y: bullet.y + bullet.vy * dt,
          };
        })
        .map((bullet) => {
          const canSteer = bullet.kind === "signal" && !bullet.returning && (bullet.age ?? 0) >= 0.24;

          if (!canSteer) {
            return bullet;
          }

          const target =
            nextEnemies.find((enemy) => enemy.id === bullet.targetId && enemy.hp > 0) ??
            nextEnemies
              .filter((enemy) => enemy.hp > 0)
              .map((enemy) => ({
                enemy,
                distance: Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y),
              }))
              .sort((a, b) => a.distance - b.distance)[0]?.enemy;

          if (!target) return bullet;

          const speed = Math.max(520, Math.hypot(bullet.vx, bullet.vy));
          const dx = target.x - bullet.x;
          const dy = target.y - bullet.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const desiredVx = (dx / distance) * speed;
          const desiredVy = (dy / distance) * speed;
          const turn = Math.min(1, dt * 6.5);

          return {
            ...bullet,
            vx: bullet.vx + (desiredVx - bullet.vx) * turn,
            vy: bullet.vy + (desiredVy - bullet.vy) * turn,
          };
        })
        .filter((bullet) => {
          if (bullet.returning && typeof bullet.originX === "number" && typeof bullet.originY === "number") {
            return Math.hypot(bullet.originX - bullet.x, bullet.originY - bullet.y) > 14;
          }

          return bullet.x > -80 && bullet.x < window.innerWidth + 80 && bullet.y > -80 && bullet.y < window.innerHeight + 80;
        });

      const remaining: BulletType[] = [];
      const damageByEnemy = new Map<string, number>();

      moved.forEach((bullet) => {
        if (bullet.returning) {
          remaining.push(bullet);
          return;
        }

        const hit = nextEnemies.find((enemy) => {
          const radius = enemy.kind === "boss" ? 58 : 38;
          return enemy.hp > 0 && Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) <= radius;
        });
        if (hit) {
          damageByEnemy.set(hit.id, (damageByEnemy.get(hit.id) ?? 0) + bullet.damage);
          if (bullet.kind === "signal") {
            remaining.push({ ...bullet, damage: 0, returning: true });
          }
        } else {
          remaining.push(bullet);
        }
      });

      if (damageByEnemy.size > 0) {
        nextEnemies = nextEnemies
          .map((enemy) => ({
            ...enemy,
            hp: enemy.hp - (damageByEnemy.get(enemy.id) ?? 0),
          }))
          .filter((enemy) => enemy.hp > 0);
        enemiesRef.current = nextEnemies;
      }

      bulletsRef.current = remaining;

      if (renderAccumulatorRef.current >= 1 / GAME_RENDER_FPS) {
        renderAccumulatorRef.current = 0;
        setBullets(remaining);
        setEnemies(nextEnemies);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      renderAccumulatorRef.current = 0;
    };
  }, []);

  const startDrag = (e: React.PointerEvent, key: TowerKey, fromTray = false) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({
      key,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      fromTray,
    });
  };

  const startEnemyDrag = (e: React.PointerEvent, enemy: EnemyType) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const now = performance.now();
    setDraggingEnemy({
      id: enemy.id,
      offsetX: e.clientX - enemy.x,
      offsetY: e.clientY - enemy.y,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTs: now,
      vx: 0,
      vy: 0,
    });
    draggingEnemyRef.current = {
      id: enemy.id,
      offsetX: e.clientX - enemy.x,
      offsetY: e.clientY - enemy.y,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTs: now,
      vx: 0,
      vy: 0,
    };
    setEnemies((current) => {
      const next = current.map((item) =>
        item.id === enemy.id
          ? { ...item, dragged: true, thrown: false, vx: 0, vy: 0, opacity: 1 }
          : item,
      );
      enemiesRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (!draggingEnemy) return;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const current = draggingEnemyRef.current;
      if (!current) return;

      const dt = Math.max(16, now - current.lastTs) / 1000;
      const x = e.clientX - current.offsetX;
      const y = e.clientY - current.offsetY;
      const vx = (e.clientX - current.lastX) / dt;
      const vy = (e.clientY - current.lastY) / dt;

      const nextDrag = {
        ...current,
        lastX: e.clientX,
        lastY: e.clientY,
        lastTs: now,
        vx,
        vy,
      };
      draggingEnemyRef.current = nextDrag;

      setEnemies((items) => {
        const next = items.map((enemy) =>
          enemy.id === current.id ? { ...enemy, x, y, dragged: true, thrown: false, opacity: 1 } : enemy,
        );
        enemiesRef.current = next;
        return next;
      });
    };

    const onUp = () => {
      const current = draggingEnemyRef.current;
      if (!current) {
        setDraggingEnemy(null);
        return;
      }

        const enemy = enemiesRef.current.find((item) => item.id === current.id);
      if (!enemy) {
        draggingEnemyRef.current = null;
        setDraggingEnemy(null);
        return;
      }

        const nearest = nearestRoadPoint(enemy.x, enemy.y);
        const shouldThrow = nearest.distance > 70;

        setEnemies((items) => {
          const next = items.map((item) => {
            if (item.id !== current.id) return item;
            if (shouldThrow) {
              return {
                ...item,
                dragged: false,
                thrown: true,
                vx: current.vx,
                vy: current.vy,
                opacity: 1,
              };
            }

            return {
              ...item,
              dragged: false,
              thrown: false,
              vx: 0,
              vy: 0,
              opacity: 1,
              progress: nearest.s,
              x: nearest.x,
              y: nearest.y,
            };
          });
          enemiesRef.current = next;
          return next;
        });

      draggingEnemyRef.current = null;
      setDraggingEnemy(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingEnemy]);

  useEffect(() => {
    if (!dragging) return;

    dragPointerYRef.current = dragging.y;

    const stopAutoScroll = () => {
      if (dragAutoScrollRafRef.current) {
        cancelAnimationFrame(dragAutoScrollRafRef.current);
        dragAutoScrollRafRef.current = null;
      }
    };

    const autoScroll = () => {
      const edge = Math.min(140, Math.max(92, window.innerHeight * 0.16));
      const maxScrollSpeed = 24;
      const pointerY = dragPointerYRef.current;
      const movedDistance = Math.hypot(dragging.x - dragging.startX, pointerY - dragging.startY);
      let scrollDelta = 0;

      if (movedDistance < 10) {
        dragAutoScrollRafRef.current = requestAnimationFrame(autoScroll);
        return;
      }

      if (pointerY > window.innerHeight - edge) {
        const strength = (pointerY - (window.innerHeight - edge)) / edge;
        scrollDelta = Math.ceil(strength * strength * maxScrollSpeed);
      } else if (pointerY < edge) {
        const strength = (edge - pointerY) / edge;
        scrollDelta = -Math.ceil(strength * strength * maxScrollSpeed);
      }

      if (scrollDelta !== 0) {
        window.scrollBy({ top: scrollDelta, behavior: "auto" });
      }

      dragAutoScrollRafRef.current = requestAnimationFrame(autoScroll);
    };

    dragAutoScrollRafRef.current = requestAnimationFrame(autoScroll);

    const onMove = (e: PointerEvent) => {
      dragPointerYRef.current = e.clientY;

      setDragging((current) =>
        current ? { ...current, x: e.clientX, y: e.clientY } : current,
      );
    };

    const onUp = (e: PointerEvent) => {
      const movedDistance = Math.hypot(e.clientX - dragging.startX, e.clientY - dragging.startY);
      if (dragging.fromTray && movedDistance < 10) {
        deployUnit(dragging.key);
        setDragging(null);
        stopAutoScroll();
        return;
      }

      const pageWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      const dropElement = document.elementFromPoint(e.clientX, e.clientY);
      const droppedOnTray = Boolean(
        trayRef.current &&
          dropElement &&
          trayRef.current.contains(dropElement) &&
          dropElement.closest("[data-unit-tray-card='true']"),
      );

      if (droppedOnTray) {
        setDeployedTowers((prev) => {
          const next = { ...prev };
          delete next[dragging.key];
          return next;
        });
        remove(dragging.key);
        setDragging(null);
        stopAutoScroll();
        return;
      }

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
      stopAutoScroll();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      stopAutoScroll();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [deployedTowers, deployUnit, dragging, place, placed, remove]);

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
  const hasUnlockedSection = (["uiux", "frontend", "techstack", "signal"] as TowerKey[]).some((k) =>
    placed.has(k),
  );
  const meMessage = useMemo(() => {
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
  }, [allOthers, deployedTowers.me, mePlaced, scrollY]);
  const draggingUnit = dragging ? UNITS.find((unit) => unit.key === dragging.key) : null;

  return (
    <div className="absolute left-0 top-0 h-[100dvh] w-full select-none overflow-hidden bg-white">
      <div ref={sceneRef} className="absolute left-0 top-0 h-full w-full overflow-hidden bg-white">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>
        <div className="hero-board-texture" aria-hidden="true" />
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
              d={ROAD_PATH_D}
              fill="none"
              stroke="hsl(208 61% 88%)"
              strokeWidth="90"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={ROAD_PATH_D}
              fill="none"
              stroke="white"
              strokeWidth="62"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="road-dashes"
              d={ROAD_PATH_D}
              fill="none"
              stroke="hsl(208 61% 82%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="16 18"
            />
          </g>
        </svg>
      </div>

      {/* render enemies */}
      {enemies.map((en) => (
        <Enemy
          key={en.id}
          enemy={{
            ...en,
            opacity: en.dragged || !hasUnlockedSection ? en.opacity : (en.opacity ?? 1) * heroEdgeOpacity(en.y),
          }}
          onPointerDown={startEnemyDrag}
        />
      ))}

      {bullets.map((bullet) => (
        <Bullet key={bullet.id} b={bullet} />
      ))}

      {Object.values(deployedTowers)
        .filter((tower): tower is DeployedTower => Boolean(tower))
        .map((tower) => {
          const unit = UNITS.find((u) => u.key === tower.key);
          if (!unit) return null;

          return (
            <div
              key={tower.key}
              className="fixed left-0 top-0 z-40 cursor-grab active:cursor-grabbing"
              style={{
                opacity: dragging?.key === tower.key ? 0 : 1,
                transform: `translate3d(${tower.x}px, ${tower.y - scrollY}px, 0) translate(-50%, -50%) scale(${
                  dragging?.key === tower.key ? 0.98 : 1
                })`,
                willChange: "transform, opacity",
              }}
              onPointerDown={(e) => startDrag(e, unit.key)}
            >
              <TowerVisual
                unit={unit}
                meMessage={unit.key === "me" ? meMessage : null}
                onRemove={(e) => handleRemove(e, unit.key)}
                shot={towerShots[tower.key]}
              />
            </div>
          );
        })}

      {dragging && draggingUnit && (
        <div
          className="fixed left-0 top-0 z-[100] pointer-events-none"
          style={{
            transform: `translate3d(${dragging.x - dragging.offsetX}px, ${dragging.y - dragging.offsetY}px, 0)`,
            willChange: "transform",
          }}
        >
          <TowerVisual unit={draggingUnit} isPreview />
        </div>
      )}

      <div
        ref={trayRef}
        className={cn(
          "absolute bottom-5 left-1/2 z-30 w-full -translate-x-1/2 bg-transparent px-3 py-3 transition-opacity duration-300",
          allOthers && "opacity-45 hover:opacity-100 focus-within:opacity-100",
        )}
      >
        <p className="text-center font-display text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Drag or tap a unit
        </p>
        <div className="flex justify-start gap-2 overflow-x-auto px-1 pb-2 pt-2 sm:justify-center">
          {UNITS.map((unit) => {
            const isPlaced = placed.has(unit.key);
            const Icon = unit.icon;
            const trayImage = towerImageFor(unit.key, towerAttackConfig(unit.key).maxAmmo);
            return (
              <button
                type="button"
                key={unit.key}
                data-unit-tray-card="true"
                onPointerDown={(e) => {
                  if (isPlaced) return;
                  const isCoarsePointer =
                    typeof window !== "undefined" &&
                    window.matchMedia("(pointer: coarse)").matches;
                  if (isCoarsePointer) return;
                  e.preventDefault();
                  startDrag(e, unit.key, true);
                }}
                onClick={(e) => {
                  const isCoarsePointer =
                    typeof window !== "undefined" &&
                    window.matchMedia("(pointer: coarse)").matches;
                  if (e.detail === 0 || isCoarsePointer) deployUnit(unit.key);
                }}
                disabled={isPlaced}
                aria-label={`Deploy ${unit.name}${unit.unlocks ? ` to unlock ${unit.unlocks}` : ""}`}
                className={cn(
                  "flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-[2.5px] border-black bg-white text-center transition-all duration-150",
                  isPlaced
                    ? "opacity-40 grayscale cursor-not-allowed"
                    : "relative z-0 cursor-grab active:cursor-grabbing shadow-[2px_2px_0_0_#000] outline-none hover:-translate-y-1 hover:z-10 focus-visible:-translate-y-1 focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-[2px] border-black flex items-center justify-center shrink-0",
                    unit.color,
                  )}
                >
                  {trayImage ? (
                    <img src={trayImage} alt="" className="h-5 w-5 object-contain sm:h-6 sm:w-6" draggable={false} />
                  ) : (
                    <Icon size={18} className="text-black sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="w-full px-1">
                  <div className="font-display font-bold text-[10px] leading-[1.05] sm:text-[11px]">{unit.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
