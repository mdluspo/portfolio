import { useEffect, useState } from "react";

export function OrbitCursor() {
  const [position, setPosition] = useState({ x: -80, y: -80 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!canHover.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setIsActive(true);
    };
    const handlePointerLeave = () => setIsActive(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      className={`orbit-cursor ${isActive ? "is-active" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)` }}
      aria-hidden="true"
    >
      <svg className="orbit-cursor-ring" viewBox="0 0 62 62" aria-hidden="true">
        <circle cx="31" cy="31" r="24" />
      </svg>
      <span className="orbit-cursor-dot" />
    </div>
  );
}
