import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RoundingOffProps {
  total: number;
  setTotal: (value: number) => void;
}

const RoundingOff: React.FC<RoundingOffProps> = ({ total, setTotal }) => {
  const [open, setOpen] = useState(false);
  const [baseTotal, setBaseTotal] = useState(total);
  const lastParentTotal = useRef(total);
  const modalRef = useRef<HTMLDivElement>(null);
  const isRounding = useRef(false);

  useEffect(() => {
    // Only update baseTotal if the change came from outside (not rounding)
    if (
      !isRounding.current &&
      Math.abs(total - lastParentTotal.current) > 0.009
    ) {
      setBaseTotal(total);
      lastParentTotal.current = total;
    }
    isRounding.current = false; // reset after checking
  }, [total]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const lower = Math.floor(baseTotal / 10) * 10;
  const upper = Math.ceil(baseTotal / 10) * 10;

  const handleSelect = (value: number) => {
    isRounding.current = true; // mark that change came from rounding
    setTotal(value);
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
      <span className="text-md font-semibold">₹ {total.toFixed(2)}</span>

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
                ₹ {lower} (
                {lower - baseTotal >= 0
                  ? `+${(lower - baseTotal).toFixed(2)}`
                  : (lower - baseTotal).toFixed(2)}
                )
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect(baseTotal)}
              >
                ₹ {baseTotal.toFixed(2)} (0.00)
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect(upper)}
              >
                ₹ {upper} (
                {upper - baseTotal >= 0
                  ? `+${(upper - baseTotal).toFixed(2)}`
                  : (upper - baseTotal).toFixed(2)}
                )
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundingOff;
