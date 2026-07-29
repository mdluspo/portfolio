import { createContext, useContext, useState, ReactNode } from 'react';

export type TowerKey = 'me' | 'uiux' | 'frontend' | 'techstack' | 'signal';

interface UnlockState {
  placed: Set<TowerKey>;
  place: (key: TowerKey) => void;
  remove: (key: TowerKey) => void;
}

const UnlockContext = createContext<UnlockState | undefined>(undefined);

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [placed, setPlaced] = useState<Set<TowerKey>>(new Set());

  const place = (key: TowerKey) => {
    setPlaced(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const remove = (key: TowerKey) => {
    setPlaced(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  return (
    <UnlockContext.Provider value={{ placed, place, remove }}>
      {children}
    </UnlockContext.Provider>
  );
}

export function useUnlockState() {
  const context = useContext(UnlockContext);
  if (!context) throw new Error('useUnlockState must be used within UnlockProvider');
  return context;
}
