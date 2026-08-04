import type { LucideIcon } from "lucide-react";
import { Code2, Layers3, Palette, Send, UserRound } from "lucide-react";
import type { TowerKey } from "./unlockState";

export type { TowerKey };

export interface Unit {
  key: TowerKey;
  name: string;
  unlocks: string;
  icon: LucideIcon;
  color: string;
  chatMessage?: string;
}

export const UNITS: Unit[] = [
  {
    key: "me",
    name: "Me",
    unlocks: "",
    icon: UserRound,
    color: "bg-primary",
    chatMessage:
      "Hi! Place the units anywhere on the board to reveal my portfolio. Each unit unlocks a different section.",
  },
  {
    key: "uiux",
    name: "About",
    unlocks: "About",
    icon: Palette,
    color: "bg-pink-200",
  },
  {
    key: "frontend",
    name: "Projects",
    unlocks: "Projects",
    icon: Code2,
    color: "bg-green-200",
  },
  {
    key: "techstack",
    name: "Tech Stack",
    unlocks: "Tech Stack",
    icon: Layers3,
    color: "bg-orange-200",
  },
  {
    key: "signal",
    name: "Contact",
    unlocks: "Contact",
    icon: Send,
    color: "bg-purple-200",
  },
];
