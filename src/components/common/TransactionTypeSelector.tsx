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
import { ChevronRight, Filter } from "lucide-react";
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
  const [type, setType] = useState<TransactionType>(initialSelection?.type ?? "all");
  const [incomeCategoryIds, setIncomeCategoryIds] = useState<string[]>(
    initialSelection?.type === "income" ? initialSelection?.categoryIds ?? [] : []
  );
  const [expenseCategoryIds, setExpenseCategoryIds] = useState<string[]>(
    initialSelection?.type === "expense" ? initialSelection?.categoryIds ?? [] : []
  );

  useEffect(() => {
    setIncomeCategoryId(incomeCategoryIds)
  }, [incomeCategoryIds])  

  useEffect(() => {
    setExpenseCategoryId(expenseCategoryIds)
  }, [expenseCategoryIds])

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
    const categoryIds = type === "income" ? incomeCategoryIds : type === "expense" ? expenseCategoryIds : [];
    onChange({ type, categoryIds });
  }, [type, incomeCategoryIds, expenseCategoryIds]);

  const toggle = (id: string, t: "income" | "expense") => {
    if (t === "income") {
      setType("income");
      setIncomeCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    } else {
      setType("expense");
      setExpenseCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    }
  };

  const makeButtonLabel = () => {
    if (type === "all") return "All Transactions";
    return type === "income" ? "Income" : "Expense";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-48 justify-start">
          <Filter className="h-4 w-4 mr-2" />
          {makeButtonLabel()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        <DropdownMenuItem onClick={() => setType("all")} className="flex items-center">
          All Transactions
          {type === "all" && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger onClick={() => setType("income")} className="flex items-center">
            Income
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72">
            {incomeCategories.map((c: any) => (
              <DropdownMenuItem
                key={c._id}
                onClick={() => toggle(c._id, "income")}
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox checked={incomeCategoryIds.includes(c._id)} className="mr-2" />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger onClick={() => setType("expense")} className="flex items-center">
            Expense
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72">
            {expenseCategories.map((c: any) => (
              <DropdownMenuItem
                key={c._id}
                onClick={() => toggle(c._id, "expense")}
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox checked={expenseCategoryIds.includes(c._id)} className="mr-2" />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
