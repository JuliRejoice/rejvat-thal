import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Dirham } from "@/components/Svg";

interface AmountInputProps {
  label: string;
  value: number;
  setValue: (v: number) => void;
  subtotal?: number;
  isPercentage?: boolean;
  onSave?: (amount: number) => void;
}

const AmountInputDialog: React.FC<AmountInputProps> = ({
  label,
  value = 0,
  setValue,
  subtotal = null,
  isPercentage = false,
  onSave,
}) => {
  const [tempValue, setTempValue] = useState<number>(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleApply = () => {
    setValue(isNaN(tempValue) ? 0 : tempValue);
    onSave?.(isNaN(tempValue) ? 0 : tempValue);
  };

  const displayAmount = isPercentage ? (subtotal * value) / 100 : value;

  return (
    <div className="flex justify-between items-center w-full">
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && value > 0) {
          setTempValue(value);
        }
        if(!isOpen){
          setTempValue(value);
          setOpen(false);
        }
      }}>
        <DialogTrigger asChild>
          <span className="font-medium cursor-pointer text-blue-700">
            {label}
          </span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm mx-auto mt-24 p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-lg font-bold mb-4">{label}</DialogTitle>

          <div className="relative w-full mb-4">
            {!isPercentage && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Dirham size={14} />
              </div>
            )}
            <Input
              type="number"
              className={`w-full p-2 rounded-sm ${!isPercentage ? 'pl-8' : ''}`}
              value={isNaN(tempValue) ? "" : tempValue}
              onFocus={() => {
                if (tempValue === 0) setTempValue(NaN);
              }}
              onBlur={() => {
                if (isNaN(tempValue)) setTempValue(0);
              }}
              onChange={(e) => {
                const val = e.target.value;
                setTempValue(val === "" ? NaN : parseFloat(val));
              }}
              placeholder={isPercentage ? "%" : "0.00"}
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => {
                setOpen(false);
                setTempValue(value);
                }}>Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleApply}>Apply</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-1 font-medium">
        {isPercentage ? (
          <>
            <Dirham size={12} />
            <span>{displayAmount.toFixed(2)}</span>
          </>
        ) : (
          <>
            <Dirham size={12} />
            <span>{value.toFixed(2)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default AmountInputDialog;
