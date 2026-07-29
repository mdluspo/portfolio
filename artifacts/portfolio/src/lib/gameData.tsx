import React from 'react';
import { TowerKey } from './unlockState';

export type { TowerKey };

export interface Unit {
  key: TowerKey;
  name: string;
  unlocks: string;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  chatMessage?: string;
}

const MeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="20" cy="12" r="6" fill="white" />
    <path d="M20 18v10" />
    <path d="M14 22h12" />
    <path d="M20 28l-6 8" />
    <path d="M20 28l6 8" />
  </svg>
);

const UiUxIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.5 40 V15 L7.5 15 L7.5 5 L12.5 5 L12.5 10 L17.5 10 L17.5 5 L22.5 5 L22.5 10 L27.5 10 L27.5 5 L32.5 5 L32.5 15 L27.5 15 V40 Z" fill="white" />
    <path d="M10 20 H30 M10 35 H30" strokeDasharray="2 2" />
    <circle cx="20" cy="26" r="4" fill="hsl(208 61% 60%)" stroke="currentColor" />
    <path d="M15 26 Q20 20 25 26 Q20 32 15 26" fill="white" />
  </svg>
);

const FrontendIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.5 40 V15 L7.5 15 L7.5 5 L12.5 5 L12.5 10 L17.5 10 L17.5 5 L22.5 5 L22.5 10 L27.5 10 L27.5 5 L32.5 5 L32.5 15 L27.5 15 V40 Z" fill="white" />
    <path d="M10 20 H30 M10 35 H30" strokeDasharray="2 2" />
    <path d="M16 23 L12 26.5 L16 30 M24 23 L28 26.5 L24 30 M18 31 L22 22" />
  </svg>
);

const TechStackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.5 40 V15 L7.5 15 L7.5 5 L12.5 5 L12.5 10 L17.5 10 L17.5 5 L22.5 5 L22.5 10 L27.5 10 L27.5 5 L32.5 5 L32.5 15 L27.5 15 V40 Z" fill="white" />
    <path d="M10 20 H30 M10 35 H30" strokeDasharray="2 2" />
    <circle cx="20" cy="26" r="4" fill="white" />
    <path d="M20 19 V21 M20 31 V33 M13 26 H15 M25 26 H27 M15 21 L16.5 22.5 M25 31 L23.5 29.5 M25 21 L23.5 22.5 M15 31 L16.5 29.5" />
  </svg>
);

const SignalIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.5 40 V15 L7.5 15 L7.5 5 L12.5 5 L12.5 10 L17.5 10 L17.5 5 L22.5 5 L22.5 10 L27.5 10 L27.5 5 L32.5 5 L32.5 15 L27.5 15 V40 Z" fill="white" />
    <path d="M10 20 H30 M10 35 H30" strokeDasharray="2 2" />
    <circle cx="20" cy="28" r="2" fill="white" />
    <path d="M16 24 Q20 20 24 24 M12 20 Q20 12 28 20" />
  </svg>
);

export const UNITS: Unit[] = [
  {
    key: 'me',
    name: 'Me',
    unlocks: '',
    icon: MeIcon,
    color: 'bg-primary',
    chatMessage: 'Hi! Place the towers on the road to reveal my portfolio. Each tower unlocks a different section. Start anywhere!'
  },
  {
    key: 'uiux',
    name: 'UI/UX Tower',
    unlocks: 'Design Process',
    icon: UiUxIcon,
    color: 'bg-pink-200'
  },
  {
    key: 'frontend',
    name: 'Frontend Tower',
    unlocks: 'Projects',
    icon: FrontendIcon,
    color: 'bg-green-200'
  },
  {
    key: 'techstack',
    name: 'Tech Stack Tower',
    unlocks: 'Tech Stack',
    icon: TechStackIcon,
    color: 'bg-orange-200'
  },
  {
    key: 'signal',
    name: 'Signal Tower',
    unlocks: 'Contact',
    icon: SignalIcon,
    color: 'bg-purple-200'
  }
];
