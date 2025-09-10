import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Filter,
} from "lucide-react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  createIncomeExpense,
  getIncomeExpense,
  getIncomeExpenseByResto,
  getTransactionByMethod,
} from "@/api/incomeExpense.api";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { IncomeExpenseForm } from "@/components/common/IncomeExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BalanceOverviewSkeleton,
  PaymentMethodStatsSkeleton,
  TransactionTableSkeleton,
} from "./ManagerIncomeExpenseSkeletons";
import {
  PaymentMethodEmpty,
  TransactionsEmpty,
} from "./ManagerIncomeExpenseEmpty";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTablePagination } from "../common/DataTablePagination";

const ManagerIncomeExpense = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBalanceOverviewDate, setSelectedBalanceOverviewDate] =
    useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [typeTransaction, setTypeTransaction] = useState("all");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const restaurantId = user.restaurantId;

  useEffect(() => {
    setSelectedEndDate(selectedBalanceOverviewDate);
    setSelectedDate(selectedBalanceOverviewDate);
  }, [selectedBalanceOverviewDate]);

  const { register, setValue, reset, unregister } = useForm({
    defaultValues: {
      expenseCategoryId: "",
      amount: "",
      method: "",
      restaurantId: "",
      description: "",
      file: null as File | null,
      date: "",
    },
  });

  const queryData = {
    restaurantId: restaurantId,
    startDate: selectedDate,
    endDate: selectedEndDate,
  };

  const cardsQueryData = {
    restaurantId: restaurantId,
    startDate: selectedBalanceOverviewDate,
  };

  const transactionQueryData = {
    ...queryData,
    page,
    limit: itemsPerPage,
    ...(typeTransaction !== "all" && { search: typeTransaction }),
  };

  const queriesResults = useQueries({
    queries: [
      {
        queryKey: ["get-income-expense-transaction", transactionQueryData],
        queryFn: () => getIncomeExpense(transactionQueryData),
      },
      {
        queryKey: ["get-transaction-by-payment-methods", cardsQueryData],
        queryFn: () => getTransactionByMethod(cardsQueryData),
      },
      {
        queryKey: ["get-total-income-expense-by-rest", cardsQueryData],
        queryFn: () => getIncomeExpenseByResto(cardsQueryData),
      },
    ],
  });

  const [
    getIncExpTransactionQuery,
    getTransactionByMethodQuery,
    getIncomeExpenseByRestoQuery,
  ] = queriesResults;
  const {
    data: getIncExpTransactionData,
    isPending: isGetIncExpTranPending,
    refetch,
  } = getIncExpTransactionQuery;
  const {
    data: getTransactionByMethodData,
    isPending: isGetTranByMthdPending,
    refetch: getTranByMthdRefetch,
  } = getTransactionByMethodQuery;
  const {
    data: getIncomeExpenseByRestData,
    isPending: isGetIncomeExpenseByResPending,
    refetch: getIncomeExpenseByRestRefetch,
  } = getIncomeExpenseByRestoQuery;

  const totalItems = getIncExpTransactionData?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paymentMethodStats = getTransactionByMethodData?.payload?.method;
  const balanceData = getIncomeExpenseByRestData?.payload;

  const { mutate: createIncExp, isPending } = useMutation({
    mutationKey: ["create-income-expense-transaction"],
    mutationFn: createIncomeExpense,
    onSuccess: () => {
      toast({
        variant: "default",
        title: `Add ${type !== "expense" ? "Income" : "Expense"} success`,
        description: `Added ${
          type !== "expense" ? "Income" : "Expense"
        } successfully`,
      });
      setIsAddingExpense(false);
      setIsAddingIncome(false);
      refetch();
      getTranByMthdRefetch();
      getIncomeExpenseByRestRefetch();
      reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Add ${type !== "expense" ? "Income" : "Expense"} failed`,
        description: `Added ${
          type !== "expense" ? "Income" : "Expense"
        } failed. Try again later`,
      });
      console.error("Error creating restaurant:", error);
    },
  });

  useEffect(() => {
    register("file", { required: "Bill or receipt is required" });
    register("method", { required: "Payment method is required" });
    if (restaurantId) {
      setValue("restaurantId", restaurantId);
    }
  }, [register, restaurantId]);

  useEffect(() => {
    if (type === "expense") {
      register("expenseCategoryId", {
        required: "Expense category is required",
      });
    } else {
      unregister("expenseCategoryId");
    }
  }, [type, register, unregister]);

  const handleStatusFilter = (value: string) => {
    setTypeTransaction(value);
  };

  const transactions = getIncExpTransactionData?.payload?.data;

  const addSubmit = (data, type) => {
    const incExpData = {
      ...data,
      type: type,
    };
    createIncExp(incExpData);
  };

  const AddIncomeExpenseContent = ({
    entryType,
  }: {
    entryType: "income" | "expense";
  }) => (
    <IncomeExpenseForm
      type={entryType}
      onSubmit={(data: any) => addSubmit(data, entryType)}
      isPending={isPending}
      showRestaurantSelector={false}
      defaultValues={{ restaurantId: restaurantId, date: selectedDate }}
      onCancel={() => {
        setIsAddingIncome(false);
        setIsAddingExpense(false);
        reset();
      }}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Income & Expense Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage your restaurant's financial transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog
            open={isAddingExpense}
            onOpenChange={(open) => {
              setIsAddingExpense(open);
              if (open) setType("expense");
              else setType("");
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrendingDown className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add Expense Entry
                </DialogTitle>
              </DialogHeader>
              <AddIncomeExpenseContent entryType="expense" />
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingIncome} onOpenChange={setIsAddingIncome}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-success">
                <TrendingUp className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add Income Entry
                </DialogTitle>
              </DialogHeader>
              <AddIncomeExpenseContent entryType="income" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Overview */}
      <Card className="shadow-card">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>Balance Overview</CardTitle>
            <div className="max-w-xs">
              <Input
                id="balanceOveviewDate"
                type="date"
                value={selectedBalanceOverviewDate}
                onChange={(e) => setSelectedBalanceOverviewDate(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {isGetIncomeExpenseByResPending || !balanceData ? (
              <BalanceOverviewSkeleton />
            ) : (
              <>
                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Opening Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{balanceData.openingBalance?.toLocaleString?.() ?? "0"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Today's Income
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-metrics-income" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-metrics-income">
                      ₹{balanceData.totalIncome?.toLocaleString?.() ?? "0"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Today's Expense
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-metrics-expense" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-metrics-expense">
                      ₹{balanceData.totalExpense?.toLocaleString?.() ?? "0"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Closing Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-metrics-balance" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-metrics-balance">
                      ₹{balanceData.closingBalance?.toLocaleString?.() ?? "0"}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Payment Method Wise Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {isGetTranByMthdPending ? (
              <PaymentMethodStatsSkeleton />
            ) : !paymentMethodStats || paymentMethodStats.length === 0 ? (
              <div className="col-span-4">
                <PaymentMethodEmpty />
              </div>
            ) : (
              paymentMethodStats?.map((payment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{payment.method}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Opening:</span>
                      <span className="font-medium text-yellow-500">
                        ₹{payment.opening?.toLocaleString?.() ?? "0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Income:</span>
                      <span className="font-medium text-metrics-income">
                        ₹{payment.income?.toLocaleString?.() ?? "0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expense:</span>
                      <span className="font-medium text-metrics-expense">
                        ₹{payment.expense?.toLocaleString?.() ?? "0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-1">
                      <span>Balance:</span>
                      <span className="text-metrics-balance">
                        ₹{payment.closing?.toLocaleString?.() ?? "0"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>
            Transaction History - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>

          {/* Right: Filters */}
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="date">Start Date</Label>
              <Input
                id="date"
                type="date"
                max={selectedEndDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex-1 max-w-xs">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                min={selectedDate}
                value={selectedEndDate}
                onChange={(e) => setSelectedEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1 max-w-xs">
              <Label htmlFor="transactionFilter">Filter</Label>
              <Select
                value={typeTransaction}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isGetIncExpTranPending ? (
                <TransactionTableSkeleton />
              ) : !transactions || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6">
                    <TransactionsEmpty />
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          transaction.type === "income"
                            ? "bg-green-100 border border-green-300 hover:bg-green-200"
                            : "bg-red-100 border border-red-300 hover:bg-red-200"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`${
                        !transaction?.expenseCategoryId?.name && "text-gray-400"
                      }`}
                    >
                      {transaction?.expenseCategoryId?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-metrics-income font-medium"
                            : "text-metrics-expense font-medium"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction?.method?.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate">
                        {transaction.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {transaction.receiptUrl ? (
                        <Badge variant="secondary" className="text-xs">
                          <Receipt className="mr-1 h-3 w-3" />
                          Attached
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No attachment
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DataTablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={(page - 1) * itemsPerPage + 1}
            endIndex={Math.min(page * itemsPerPage, totalItems)}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
            onPageChange={setPage}
            onNextPage={() => setPage((p) => p + 1)}
            onPreviousPage={() => setPage((p) => p - 1)}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerIncomeExpense;
