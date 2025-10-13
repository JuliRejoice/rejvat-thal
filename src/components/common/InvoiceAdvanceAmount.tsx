import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface InvoiceAdvanceAmountProps {
  total: number;
  onSave: (amount: number, status: string) => void;
}

const InvoiceAdvanceAmount: React.FC<InvoiceAdvanceAmountProps> = ({
  total,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<number>(0); // store saved value

  const numericValue = parseFloat(advanceAmountInput) || 0;

  const getButtonLabel = () => {
    if (numericValue < total) return "Save Part Paid";
    if (numericValue > total) return "Save Advance";
    return "Save Paid";
  };

  const handleSave = () => {
    const status =
      numericValue < total
        ? "part-paid"
        : numericValue > total
        ? "advance"
        : "paid";

    const amountToSave = numericValue;
    setSavedAmount(amountToSave); // save the amount
    onSave(amountToSave, status);
    setOpen(false);
    setAdvanceAmountInput(""); // reset input for next edit
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="font-medium text-blue-700 cursor-pointer">
            + Advance Amount
          </span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogTitle>Enter Advance Amount</DialogTitle>

          <div className="flex flex-col gap-3 mt-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={advanceAmountInput}
              onFocus={(e) => {
                if (e.target.value === "0") setAdvanceAmountInput("");
              }}
              onChange={(e) =>
                setAdvanceAmountInput(e.target.value.replace(/^0+(?=\d)/, ""))
              }
            />

            <div className="flex justify-end gap-2 mt-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>{getButtonLabel()}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {savedAmount > 0 && !open && (
        <span className="font-medium text-blue-700">₹ {savedAmount}</span>
      )}
    </div>
  );
};

export default InvoiceAdvanceAmount;
