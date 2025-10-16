import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dirham } from "@/components/Svg";

interface RoundingOffProps {
  baseTotal: number; // total without rounding
  roundingValue: number; // current rounding difference
  setRoundingValue: (value: number) => void; // function to set rounding
  total: number; // final total including rounding
}

const RoundingOff: React.FC<RoundingOffProps> = ({
  baseTotal,
  roundingValue,
  setRoundingValue,
  total,
}) => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Calculate rounding options
  const lower = Math.floor(baseTotal / 10) * 10;
  const upper = Math.ceil(baseTotal / 10) * 10;

  // Handle selecting a rounding option
  const handleSelect = (value: number) => {
    setRoundingValue(value - baseTotal); // difference from base total
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        className="p-0 text-blue-700 hover:bg-transparent text-md hover:text-blue-700 h-0"
        onClick={() => setOpen(true)}
      >
        Rounding Off
      </Button>

      <div className="flex items-center gap-1 text-md font-semibold">
        <Dirham size={12} />
        <span>{roundingValue.toFixed(2)}</span>
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-lg w-72 relative"
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>

            <h3 className="text-center text-sm font-semibold mb-4">
              Choose Rounding
            </h3>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect(lower)}
              >
                <div className="flex items-center gap-1">
                  <Dirham size={10} />
                  <span>
                    {lower} (
                    {lower - baseTotal >= 0 ? "+" : ""}
                    {(lower - baseTotal).toFixed(2)})
                  </span>
                </div>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect(baseTotal)}
              >
                <div className="flex items-center gap-1">
                  <Dirham size={12} />
                  <span>{baseTotal.toFixed(2)} (0.00)</span>
                </div>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect(upper)}
              >
                <div className="flex items-center gap-1">
                  <Dirham size={12} />
                  <span>
                    {upper} (
                    {upper - baseTotal >= 0 ? "+" : ""}
                    {(upper - baseTotal).toFixed(2)})
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundingOff;
