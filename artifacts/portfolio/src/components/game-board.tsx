import React, { useState } from "react";
import { motion } from "framer-motion";
import { UNITS, TowerKey } from "@/lib/gameData";
import { useUnlockState } from "@/lib/unlockState";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SPOTS = [
  { id: 0, left: "25%", top: "75%" },
  { id: 1, left: "45%", top: "55%" },
  { id: 2, left: "65%", top: "35%" },
  { id: 3, left: "85%", top: "20%" },
];

export function GameBoard() {
  const { placed, place, remove } = useUnlockState();
  const [selectedUnit, setSelectedUnit] = useState<TowerKey | null>(null);
  const [spotAssignments, setSpotAssignments] = useState<Record<number, TowerKey>>({});

  const handleSpotClick = (spotId: number) => {
    if (selectedUnit && !placed.has(selectedUnit)) {
      setSpotAssignments(prev => ({ ...prev, [spotId]: selectedUnit }));
      place(selectedUnit);
      setSelectedUnit(null);
    }
  };

  const handleRemove = (e: React.MouseEvent, spotId: number, unitKey: TowerKey) => {
    e.stopPropagation();
    setSpotAssignments(prev => {
      const next = { ...prev };
      delete next[spotId];
      return next;
    });
    remove(unitKey);
  };

  const placedCount = placed.size;
  const meUnit = UNITS.find(u => u.key === 'me');
  const meMessage = placedCount === 4 
    ? "You've unlocked everything. Scroll down to explore!" 
    : placedCount > 0 
    ? "Keep going! Each tower reveals something new."
    : meUnit?.chatMessage;

  const trayUnits = UNITS.filter(u => u.key !== 'me');

  return (
    <div className="flex-1 flex flex-col w-full h-full relative border-t-[3px] lg:border-t-0 border-black">
      
      {/* SCENE AREA */}
      <div className="flex-1 relative w-full min-h-[400px] overflow-hidden">
        {/* The Road */}
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path 
            d="M -100,1000 C 300,900 700,400 1100,100"
            fill="none"
            stroke="hsl(208, 61%, 85%)"
            strokeWidth="160"
            strokeLinecap="round"
          />
          <path 
            d="M -100,1000 C 300,900 700,400 1100,100"
            fill="none"
            stroke="white"
            strokeWidth="140"
            strokeLinecap="round"
          />
        </svg>

        {/* Me Stickfigure */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: "15%", top: "88%", transform: "translate(-50%, -100%)" }}>
          <motion.div
            key={placedCount}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border-cartoon px-4 py-3 rounded-2xl shadow-cartoon-sm mb-4 w-48 text-center text-sm font-sans font-bold relative"
          >
            {meMessage}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black rotate-45" />
          </motion.div>
          {meUnit && <meUnit.icon size={80} className="text-black drop-shadow-md" />}
        </div>

        {/* Placement Spots */}
        {SPOTS.map((spot) => {
          const unitKey = spotAssignments[spot.id];
          const unit = unitKey ? trayUnits.find(u => u.key === unitKey) : null;
          
          return (
            <div 
              key={spot.id}
              className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: spot.left, top: spot.top }}
            >
              {!unit ? (
                <div 
                  onClick={() => handleSpotClick(spot.id)}
                  className={cn(
                    "w-16 h-16 rounded-full border-[4px] border-dashed transition-all bg-white/50",
                    selectedUnit ? "border-primary cursor-pointer hover:bg-primary/20 animate-pulse shadow-cartoon-blue" : "border-black/20"
                  )}
                />
              ) : (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="relative group flex flex-col items-center"
                >
                  <div className={cn("w-20 h-28 rounded-xl border-cartoon flex items-center justify-center shadow-cartoon bg-white", unit.color)}>
                    <unit.icon size={48} className="text-black" />
                  </div>
                  <div className="absolute top-full mt-3 whitespace-nowrap bg-white border-2 border-black px-3 py-1.5 rounded-lg text-xs font-display font-bold shadow-cartoon-sm z-10">
                    {unit.name}
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, spot.id, unit.key)}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-destructive text-white border-[3px] border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm z-20"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* HORIZONTAL UNIT TRAY */}
      <div className="w-full bg-white border-t-[3px] border-black p-4 md:p-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <h3 className="font-display text-sm uppercase tracking-wider text-gray-500 mb-3 ml-2">Available Towers</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
          {trayUnits.map(unit => {
            const isPlaced = placed.has(unit.key);
            const isSelected = selectedUnit === unit.key;
            return (
              <button
                key={unit.key}
                onClick={() => !isPlaced && setSelectedUnit(isSelected ? null : unit.key)}
                className={cn(
                  "snap-start flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 w-48 sm:w-64 rounded-2xl border-cartoon transition-all text-left bg-white relative",
                  isPlaced ? "opacity-50 grayscale bg-gray-100 cursor-not-allowed shadow-none" : "cursor-pointer hover:-translate-y-1 shadow-cartoon-sm hover:shadow-cartoon",
                  isSelected && !isPlaced && "ring-4 ring-primary ring-offset-2 border-primary translate-y-[-4px] shadow-cartoon"
                )}
              >
                <div className={cn("w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center shrink-0 shadow-sm", unit.color)}>
                  <unit.icon size={28} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg truncate">{unit.name}</div>
                  <div className="text-xs font-sans text-gray-600 font-bold truncate mt-1">Unlocks: <span className="text-primary">{unit.unlocks}</span></div>
                </div>
                {isPlaced && (
                  <div className="absolute inset-0 bg-black/5 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-black text-white text-xs font-display px-3 py-1 rounded-full uppercase tracking-wider shadow-md">Deployed</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  );
}
