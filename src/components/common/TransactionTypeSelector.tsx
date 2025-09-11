import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { getAllExpenseCategory } from "@/api/expenseCategory.api";
import { getAllIncomeCategory } from "@/api/incomeCategories.api";

type TransactionType = "all" | "income" | "expense";

export type TransactionSelection = {
  type: TransactionType;
  categoryIds: string[];
};

export default function TransactionTypeSelector({
  onChange,
  initialSelection,
  setIncomeCategoryId,
  setExpenseCategoryId
}: {
  onChange?: (selection: TransactionSelection) => void;
  initialSelection?: TransactionSelection;
  setIncomeCategoryId: any;
  setExpenseCategoryId: any;
}) {
  const [appliedType, setAppliedType] = useState<TransactionType>(initialSelection?.type ?? "all");
  const [appliedIncomeCategoryIds, setAppliedIncomeCategoryIds] = useState<string[]>(
    initialSelection?.type === "income" ? initialSelection?.categoryIds ?? [] : []
  );
  const [appliedExpenseCategoryIds, setAppliedExpenseCategoryIds] = useState<string[]>(
    initialSelection?.type === "expense" ? initialSelection?.categoryIds ?? [] : []
  );

  const [tempType, setTempType] = useState<TransactionType>(initialSelection?.type ?? "all");
  const [tempIncomeCategoryIds, setTempIncomeCategoryIds] = useState<string[]>(
    initialSelection?.type === "income" ? initialSelection?.categoryIds ?? [] : []
  );
  const [tempExpenseCategoryIds, setTempExpenseCategoryIds] = useState<string[]>(
    initialSelection?.type === "expense" ? initialSelection?.categoryIds ?? [] : []
  );
  const [tempSelectAllIncome, setTempSelectAllIncome] = useState<boolean>(false);
  const [tempSelectAllExpense, setTempSelectAllExpense] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setIncomeCategoryId(appliedType === "income" ? appliedIncomeCategoryIds : []);
  }, [appliedType, appliedIncomeCategoryIds])

  useEffect(() => {
    setExpenseCategoryId(appliedType === "expense" ? appliedExpenseCategoryIds : []);
  }, [appliedType, appliedExpenseCategoryIds])

  const queries = useQueries({
    queries: [
      {
        queryKey: ["filter-income-categories"],
        queryFn: () => getAllIncomeCategory({ status: true }),
      },
      {
        queryKey: ["filter-expense-categories"],
        queryFn: () => getAllExpenseCategory({ status: true }),
      },
    ],
  });

  const incomeCategories = useMemo(
    () => queries[0].data?.payload?.data ?? [],
    [queries]
  );
  const expenseCategories = useMemo(
    () => queries[1].data?.payload?.data ?? [],
    [queries]
  );

  useEffect(() => {
    if (!onChange) return;
    const categoryIds = appliedType === "income" ? appliedIncomeCategoryIds : appliedType === "expense" ? appliedExpenseCategoryIds : [];
    onChange({ type: appliedType, categoryIds });
  }, [appliedType, appliedIncomeCategoryIds, appliedExpenseCategoryIds]);

  const toggleTempCategory = (id: string, t: "income" | "expense") => {
    if (t === "income") {
      setTempType("income");
      setTempSelectAllExpense(false);
      setTempExpenseCategoryIds([]);
      setTempSelectAllIncome(false);
      setTempIncomeCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    } else {
      setTempType("expense");
      setTempSelectAllIncome(false);
      setTempIncomeCategoryIds([]);
      setTempSelectAllExpense(false);
      setTempExpenseCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    }
  };

  const handleSelectAll = (t: "income" | "expense") => {
    if (t === "income") {
      setTempType("income");
      setTempSelectAllIncome((prev) => {
        const next = !prev;
        if (next) {
          setTempIncomeCategoryIds(incomeCategories.map((c: any) => c._id));
          setTempSelectAllExpense(false);
          setTempExpenseCategoryIds([]);
        } else {
          setTempIncomeCategoryIds([]);
        }
        return next;
      });
    } else {
      setTempType("expense");
      setTempSelectAllExpense((prev) => {
        const next = !prev;
        if (next) {
          setTempExpenseCategoryIds(expenseCategories.map((c: any) => c._id));
          setTempSelectAllIncome(false);
          setTempIncomeCategoryIds([]);
        } else {
          setTempExpenseCategoryIds([]);
        }
        return next;
      });
    }
  };

  const handleApply = () => {
    if (tempType === "income") {
      setAppliedType("income");
      setAppliedIncomeCategoryIds(tempSelectAllIncome ? [] : tempIncomeCategoryIds);
      setAppliedExpenseCategoryIds([]);
    } else if (tempType === "expense") {
      setAppliedType("expense");
      setAppliedExpenseCategoryIds(tempSelectAllExpense ? [] : tempExpenseCategoryIds);
      setAppliedIncomeCategoryIds([]);
    } else {
      setAppliedType("all");
      setAppliedIncomeCategoryIds([]);
      setAppliedExpenseCategoryIds([]);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setTempType(appliedType);
    setTempIncomeCategoryIds(appliedIncomeCategoryIds);
    setTempExpenseCategoryIds(appliedExpenseCategoryIds);
    setTempSelectAllIncome(false);
    setTempSelectAllExpense(false);
  };

  const makeButtonLabel = () => {
    if (appliedType === "all") return "All Transactions";
    return appliedType === "income" ? "Income" : "Expense";
  };

  const clearFilter = () => {
    setAppliedType("all");
    setAppliedIncomeCategoryIds([]);
    setAppliedExpenseCategoryIds([]);
    setTempType("all");
    setTempIncomeCategoryIds([]);
    setTempExpenseCategoryIds([]);
    setTempSelectAllIncome(false);
    setTempSelectAllExpense(false);
  };

  const isFiltered = appliedType !== "all";

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-48 justify-start relative">
            <Filter className="h-4 w-4 mr-2" />
            {makeButtonLabel()}
            {isFiltered && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72">
          <div className="px-3 py-2 text-sm flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Filter</span>
            <button
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                clearFilter();
              }}
            >
              Clear All
            </button>
          </div>
          <div className="h-px bg-border" />

            <DropdownMenuItem
              onClick={() => {
                setTempType("all");
                setTempIncomeCategoryIds([]);
                setTempExpenseCategoryIds([]);
                setTempSelectAllIncome(false);
                setTempSelectAllExpense(false);
              }}
              onSelect={(e) => e.preventDefault()}
              className="flex items-center"
            >
              <Checkbox checked={tempType === "all"} className="mr-2" />
              All Transactions
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center">
                Income
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-72">
                <DropdownMenuItem
                  onClick={() => handleSelectAll("income")}
                  onSelect={(e) => e.preventDefault()}
                  className="border-b border-blue-500"
                >
                  <Checkbox checked={tempSelectAllIncome} className="mr-2" />
                  Select All
                </DropdownMenuItem>
                {incomeCategories.map((c: any) => (
                  <DropdownMenuItem
                    key={c._id}
                    onClick={() => toggleTempCategory(c._id, "income")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={tempSelectAllIncome || tempIncomeCategoryIds.includes(c._id)}
                      className="mr-2"
                    />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center">
                Expense
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-72">
                <DropdownMenuItem
                  onClick={() => handleSelectAll("expense")}
                  onSelect={(e) => e.preventDefault()}
                  className="border-b border-blue-500 pb-2"
                >
                  <Checkbox checked={tempSelectAllExpense} className="mr-2" />
                  Select All
                </DropdownMenuItem>
                {expenseCategories.map((c: any) => (
                  <DropdownMenuItem
                    key={c._id}
                    onClick={() => toggleTempCategory(c._id, "expense")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={tempSelectAllExpense || tempExpenseCategoryIds.includes(c._id)}
                      className="mr-2"
                    />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Actions */}
            <div className="px-2 py-2 flex gap-2 justify-end">
              <button
                className="text-sm px-3 py-1 rounded border"
                onClick={(e) => {
                  e.preventDefault();
                  handleCancel();
                }}
              >
                Cancel
              </button>
              <button
                className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  handleApply();
                }}
              >
                Apply
              </button>
            </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
