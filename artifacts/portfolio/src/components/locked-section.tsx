import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnlockState, TowerKey } from "@/lib/unlockState";

const LockIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface LockedSectionProps {
  unlockKey: TowerKey;
  title: string;
  towerName: string;
  children: ReactNode;
}

export function LockedSection({ unlockKey, title, towerName, children }: LockedSectionProps) {
  const { placed } = useUnlockState();
  const isUnlocked = placed.has(unlockKey);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {!isUnlocked && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[2px] p-4"
          >
            <div className="bg-white border-[3px] border-cartoon border-dashed border-gray-400 p-8 rounded-3xl max-w-md text-center shadow-lg">
              <div className="flex justify-center mb-4 text-gray-400">
                <LockIcon size={64} />
              </div>
              <h3 className="text-2xl font-display text-gray-500 mb-2">{title}</h3>
              <p className="font-sans font-bold text-gray-600">
                Place the <span className="text-primary">{towerName}</span> on the road to unlock this section.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={isUnlocked ? { opacity: 1, y: 0 } : { opacity: 0.2, y: 20 }}
        className={!isUnlocked ? "pointer-events-none select-none overflow-hidden h-[400px]" : "h-auto"}
      >
        {children}
      </motion.div>
    </div>
  );
}
