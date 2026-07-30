import React from "react";
import { Send } from "lucide-react";

export type BulletType = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  kind?: string;
  age?: number;
  originX?: number;
  originY?: number;
  targetId?: string;
  returning?: boolean;
};

export const Bullet = React.memo(function Bullet({ b }: { b: BulletType }) {
  const common = {
    transform: `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%)`,
    willChange: "transform",
  } as React.CSSProperties;
  const flightAngle = Math.atan2(b.vy, b.vx) * (180 / Math.PI) + 45;

  if (b.kind && b.kind.startsWith("token")) {
    const char = b.kind === "token1" ? "<" : b.kind === "token2" ? "/" : ">";
    return (
      <div className="absolute left-0 top-0 z-50 pointer-events-none" style={common}>
        <div
          className="font-display text-4xl font-black leading-none text-black animate-bounce"
          style={{
            WebkitTextStroke: "1px black",
            textShadow: "2px 2px 0 rgba(0,0,0,0.18)",
          }}
        >
          {char}
        </div>
      </div>
    );
  }

  if (b.kind === "paint") {
    return (
      <div className="absolute left-0 top-0 z-50 pointer-events-none" style={common}>
        <div className="h-5 w-5 rounded-full bg-black shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] animate-pulse" />
      </div>
    );
  }

  if (b.kind === "disk") {
    return (
      <div className="absolute left-0 top-0 z-40 pointer-events-none" style={common}>
        <img
          src="/layer_bullet.png"
          alt=""
          className="h-11 w-11 object-contain animate-spin-slow drop-shadow-[1px_1px_0_#000]"
          draggable={false}
        />
      </div>
    );
  }

  if (b.kind === "signal") {
    return (
      <div className="absolute left-0 top-0 z-50 pointer-events-none" style={common}>
        <div
          className="drop-shadow-[2px_2px_0_#000]"
          style={{
            transform: `rotate(${flightAngle}deg)`,
          }}
        >
          <Send size={38} className="fill-purple-200 text-black" strokeWidth={2.8} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute left-0 top-0 z-40 pointer-events-none"
      style={common}
    >
      <div className="h-3 w-3 rounded-full bg-black" />
    </div>
  );
});

export default Bullet;
