import { Target, MessageSquare, Code2, Link as LinkIcon, Zap } from "lucide-react";

export type UnitType = "ARCHER" | "MAGE" | "KNIGHT" | "SCOUT" | "CANNON";

export interface UnitDef {
  id: UnitType;
  name: string;
  icon: React.ElementType;
  color: string;
  title: string;
  content: React.ReactNode;
}

export const UNITS: UnitDef[] = [
  {
    id: "ARCHER",
    name: "Archer",
    icon: Target,
    color: "bg-blue-200",
    title: "Identity",
    content: "Hi, I'm Alex. Frontend & UX Developer.",
  },
  {
    id: "MAGE",
    name: "Mage",
    icon: Zap,
    color: "bg-purple-200",
    title: "About Me",
    content: "Studying design & code. Passionate about interfaces that feel alive and interactions that spark joy.",
  },
  {
    id: "KNIGHT",
    name: "Knight",
    icon: Code2,
    color: "bg-green-200",
    title: "Arsenal",
    content: "HTML, CSS, TS, React, Figma, Framer Motion. Built to defend against bad UX.",
  },
  {
    id: "SCOUT",
    name: "Scout",
    icon: LinkIcon,
    color: "bg-yellow-200",
    title: "Comms",
    content: "GitHub: @alexdev\nLinkedIn: /in/alexux\nEmail: hello@alex.dev",
  },
  {
    id: "CANNON",
    name: "Cannon",
    icon: MessageSquare,
    color: "bg-red-200",
    title: "Action",
    content: "Ready to make an impact. Let's build something unforgettable.",
  },
];
