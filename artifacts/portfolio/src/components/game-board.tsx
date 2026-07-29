import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UNITS, UnitDef } from "@/lib/gameData";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface GameBoardProps {
  onUnitsPlacedCountChange: (count: number) => void;
}

interface GridSlot {
  id: string;
  unit: UnitDef | null;
}

export function GameBoard({ onUnitsPlacedCountChange }: GameBoardProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitDef | null>(null);
  const [slots, setSlots] = useState<GridSlot[]>(
    Array.from({ length: 15 }).map((_, i) => ({ id: `slot-${i}`, unit: null }))
  );
  
  // Track units that have been placed anywhere
  const placedUnitIds = slots.filter((s) => s.unit !== null).map((s) => s.unit!.id);
  const placedCount = placedUnitIds.length;
  
  // Update parent when count changes
  React.useEffect(() => {
    onUnitsPlacedCountChange(placedCount);
  }, [placedCount, onUnitsPlacedCountChange]);

  const handleSlotClick = (index: number) => {
    if (selectedUnit) {
      // Place unit
      const newSlots = [...slots];
      
      // If unit is already placed elsewhere, remove it from there
      const existingIndex = newSlots.findIndex((s) => s.unit?.id === selectedUnit.id);
      if (existingIndex !== -1) {
        newSlots[existingIndex].unit = null;
      }
      
      newSlots[index].unit = selectedUnit;
      setSlots(newSlots);
      setSelectedUnit(null); // deselect after placing
    }
  };

  const removeUnit = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newSlots = [...slots];
    newSlots[index].unit = null;
    setSlots(newSlots);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-6xl mx-auto z-10 relative">
      
      {/* Unit Tray */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0 md:order-2">
        <div className="bg-white border-cartoon shadow-cartoon p-4 rounded-2xl flex flex-col gap-4 w-full">
          <h3 className="font-display text-center text-lg uppercase tracking-wider">Barracks</h3>
          <p className="text-xs text-center text-muted-foreground font-sans font-semibold">
            {selectedUnit ? "Click grid to place" : "Select a unit"}
          </p>
          <div className="flex md:flex-col gap-3">
            {UNITS.map((unit) => {
              const isPlaced = placedUnitIds.includes(unit.id);
              const isSelected = selectedUnit?.id === unit.id;
              
              return (
                <button
                  key={unit.id}
                  onClick={() => !isPlaced && setSelectedUnit(isSelected ? null : unit)}
                  disabled={isPlaced}
                  className={cn(
                    "relative flex items-center gap-3 p-3 rounded-xl border-[2px] border-black transition-all text-left",
                    isPlaced ? "opacity-50 grayscale cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 cursor-pointer shadow-cartoon-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]",
                    isSelected && "ring-4 ring-primary ring-offset-2 bg-primary/10 border-primary"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center shrink-0", unit.color)}>
                    <unit.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="hidden md:block flex-1">
                    <div className="font-display text-sm">{unit.name}</div>
                  </div>
                  {isPlaced && (
                    <div className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center">
                      <span className="bg-black text-white text-[10px] font-display px-2 py-0.5 rounded-full uppercase">Deployed</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 w-full bg-white/50 backdrop-blur-sm border-cartoon shadow-cartoon p-4 md:p-8 rounded-3xl md:order-1">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {slots.map((slot, i) => (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(i)}
              className={cn(
                "relative aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center",
                !slot.unit && "border-2 border-dashed border-primary/40 bg-primary/5 cursor-pointer",
                !slot.unit && selectedUnit && "hover:border-primary hover:bg-primary/20 hover:scale-105",
                slot.unit && "cursor-default"
              )}
            >
              <AnimatePresence>
                {slot.unit && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 z-20 group"
                  >
                    <div className={cn(
                      "w-full h-full rounded-2xl border-cartoon flex items-center justify-center shadow-cartoon-sm",
                      slot.unit.color
                    )}>
                      <slot.unit.icon size={40} className="text-black" strokeWidth={2} />
                      
                      {/* Info Card Popover */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute bottom-full mb-4 w-48 bg-white border-cartoon p-3 rounded-xl shadow-cartoon pointer-events-none z-30 flex flex-col gap-1 origin-bottom"
                      >
                        <div className="font-display text-sm font-bold">{slot.unit.title}</div>
                        <div className="text-xs font-sans font-semibold leading-tight whitespace-pre-wrap">
                          {slot.unit.content}
                        </div>
                        {/* Triangle pointer */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black rotate-45" />
                      </motion.div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => removeUnit(e, i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white border-2 border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
