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

interface AmountInputProps {
  label: string;
  value: number;
  setValue: (v: number) => void;
  subtotal?: number;
  isPercentage?: boolean;
}

const AmountInputDialog: React.FC<AmountInputProps> = ({
  label,
  value = 0,
  setValue,
  subtotal = null,
  isPercentage = false,
}) => {
  const [tempValue, setTempValue] = useState<number>(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleApply = () => {
    setValue(isNaN(tempValue) ? 0 : tempValue);
  };

  const displayAmount = isPercentage ? (subtotal * value) / 100 : value;

  return (
    <div className="flex justify-between items-center w-full">
      <Dialog>
        <DialogTrigger asChild>
          <span className="font-medium cursor-pointer text-blue-700">
            {label}
          </span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm mx-auto mt-24 p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-lg font-bold mb-4">{label}</DialogTitle>

          <Input
            type="number"
            className="w-full p-2 rounded-sm mb-4"
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
            placeholder={isPercentage ? "%" : "₹"}
          />

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleApply}>Apply</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <span className="font-medium">
        {isPercentage
          ? `₹ ${displayAmount.toFixed(2)}`
          : `₹ ${value.toFixed(2)}`}
      </span>
    </div>
  );
};

export default AmountInputDialog;
