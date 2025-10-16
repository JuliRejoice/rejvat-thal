import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Filter,
  Receipt,
  ChevronDown,
  X,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { getRestaurants } from "@/api/restaurant.api";
import {
  getIncomeExpense,
  getTransactionByMethod,
  getIncomeExpenseByResto,
} from "@/api/incomeExpense.api";
import { SearchableDropDown } from "../common/SearchableDropDown";
import {
  BalanceOverviewSkeleton,
  PaymentMethodStatsSkeleton,
  TransactionTableSkeleton,
} from "../manager/ManagerIncomeExpenseSkeletons";
import {
  PaymentMethodEmpty,
  TransactionsEmpty,
} from "../manager/ManagerIncomeExpenseEmpty";
import { DataTablePagination } from "../common/DataTablePagination";
import TransactionFilterDropdown from "../common/TransactionTypeSelector";
import { DropdownMenu, DropdownMenuItem, DropdownMenuGroup, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { getPaymentMethods } from "@/api/paymentMethod.api";
import { Dirham } from "../Svg";

const IncomeExpenseManagement = () => {
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBalanceOverviewDate, setSelectedBalanceOverviewDate] =
    useState(new Date().toISOString().split("T")[0]);
  const [typeTransaction, setTypeTransaction] = useState("all");
  const [expenseCategoryId, setExpenseCategoryId] = useState([]);
  const [incomeCategoryId, setIncomeCategoryId] = useState([]);
  const [restaurantsOptions, setRestaurantsOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [restaurant, setRestaurant] = useState("");

  useEffect(() => {
    setRestaurant(restaurantsOptions[0]?.id);
  }, [restaurantsOptions]);

  const queryArgs = useMemo(
    () => ({
      restaurantId: restaurant,
      startDate: selectedDate,
      endDate: selectedEndDate,
    }),
    [selectedDate, restaurant]
  );

  const transactionQueryData = {
    ...queryArgs,
    page,
    limit: itemsPerPage,
    ...(typeTransaction !== "all" && { type: typeTransaction }),
    ...(paymentFilter && { paymentMethodId: paymentFilter }),
    ...(expenseCategoryId?.length > 0 && { expenseCategoryId }),
    ...(incomeCategoryId?.length > 0 && { incomeCategoryId }),
  }; 

  const cardsQueryData = {
    restaurantId: restaurant,
    startDate: selectedBalanceOverviewDate,
    endDate: selectedBalanceOverviewDate,
  };

  const queriesResults = useQueries({
    queries: [
      {
        queryKey: ["restaurants-admin"],
        queryFn: () => getRestaurants({}),
      },
      {
        queryKey: ["transactions-admin", transactionQueryData],
        queryFn: () => getIncomeExpense(transactionQueryData),
        enabled: Boolean(restaurant),
      },
      {
        queryKey: ["get-payment-methods"],
        queryFn: () => getPaymentMethods(),
      },
      {
        queryKey: ["transactions-by-method-admin", cardsQueryData],
        queryFn: () => getTransactionByMethod(cardsQueryData),
        enabled: Boolean(restaurant),
      },
      {
        queryKey: ["get-total-income-expense-by-rest", cardsQueryData],
        queryFn: () => getIncomeExpenseByResto(cardsQueryData),
        enabled: Boolean(restaurant),
      },
    ],
  });

  const [
    restaurantsQuery,
    getIncExpTransactionQuery,
    getPaymentMethodsQuery,
    getTransactionByMethodQuery,
    getIncomeExpenseByRestoQuery,
  ] = queriesResults;

  const { data: getAllRestaurants } = restaurantsQuery;
  const { data: paymentMethods } = getPaymentMethodsQuery;

  useEffect(() => {
    if (getAllRestaurants?.payload?.data) {
      setRestaurantsOptions(
        getAllRestaurants.payload.data.map((r) => ({
          id: r._id,
          name: r.name,
        }))
      );
    }
  }, [getAllRestaurants]);

  useEffect(() => {
    setSelectedEndDate(selectedBalanceOverviewDate);
    setSelectedDate(selectedBalanceOverviewDate);
  }, [selectedBalanceOverviewDate]);

  const handleSearch = async (query: string) => {
    const res = await getRestaurants({ search: query });
    setRestaurantsOptions(
      res.payload.data.map((r) => ({
        id: r._id,
        name: r.name,
      }))
    );
  };
  const { data: getIncExpTransactionData, isPending: isGetIncExpTranPending } =
    getIncExpTransactionQuery;
  const {
    data: getIncomeExpenseByRestData,
    isPending: isGetIncomeExpenseByResPending,
  } = getIncomeExpenseByRestoQuery;
  const {
    data: getTransactionByMethodData,
    isPending: isGetTranByMthdPending,
  } = getTransactionByMethodQuery;




  const balanceData = getIncomeExpenseByRestData?.payload;
  const paymentMethodStats = getTransactionByMethodData?.payload?.method;
  const transactions = getIncExpTransactionData?.payload?.data;


  const totalItems = getIncExpTransactionData?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Income & Expense Management
          </h1>
          <p className="text-muted-foreground">
            Track financial transactions across all restaurants
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div>
                <Label htmlFor="restaurant">Restaurant</Label>
                <SearchableDropDown
                  options={restaurantsOptions}
                  onSearch={handleSearch}
                  value={restaurant}
                  onChange={(val) => {
                    setRestaurant(val);
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <div className="flex items-center text-2xl font-bold text-yellow-500 gap-1">
                      <Dirham size={18} />
                      <span>{balanceData.openingBalance?.toLocaleString?.() ?? "0"}</span>
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
                    <div className="flex items-center text-2xl font-bold text-metrics-income gap-1">
                      <Dirham size={18} />
                      <span>{balanceData.totalIncome?.toLocaleString?.() ?? "0"}</span>
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
                    <div className="flex items-center text-2xl font-bold text-metrics-expense gap-1">
                      <Dirham size={18} />
                      <span>{balanceData.totalExpense?.toLocaleString?.() ?? "0"}</span>
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
                    <div className="flex items-center text-2xl font-bold text-metrics-balance gap-1">
                      <Dirham size={18} />
                      <span>{balanceData.closingBalance?.toLocaleString?.() ?? "0"}</span>
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
              paymentMethodStats?.sort((a, b) => a.method.localeCompare(b.method))?.map((payment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{payment.method}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Opening:</span>
                      <span className="flex items-center gap-1 font-medium text-yellow-500">
                        <Dirham size={12} />
                        <span>{payment.opening?.toLocaleString?.() ?? "0"}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Income:</span>
                      <span className="flex items-center gap-1 font-medium text-metrics-income">
                        <Dirham size={12} />
                        <span>{payment.income?.toLocaleString?.() ?? "0"}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expense:</span>
                      <span className="flex items-center gap-1 font-medium text-metrics-expense">
                        <Dirham size={12} />
                        <span>{payment.expense?.toLocaleString?.() ?? "0"}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-1">
                      <span>Balance:</span>
                      <span className="flex items-center gap-1 text-metrics-balance">
                        <Dirham size={12} />
                        <span>{payment.closing?.toLocaleString?.() ?? "0"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List or Balance View */}
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
              <Label>Filter</Label>
              <TransactionFilterDropdown
                onChange={({ type }) => {
                  setTypeTransaction(type);
                }}
                setIncomeCategoryId={setIncomeCategoryId}
                setExpenseCategoryId={setExpenseCategoryId}
              />
            </div>
            <div className="flex-1 w-[200px]">
              <Label htmlFor="paymentFilter">Payment Method</Label>
              <div className="relative w-48">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center justify-between w-full relative ${paymentFilter ? "pr-12" : "pr-8"
                        }`}
                    >
                      <span className="truncate">
                        {paymentFilter
                          ? paymentMethods?.payload?.data?.find(
                            (m) => m._id === paymentFilter
                          )?.type
                          : "Select Payment Method"}
                      </span>

                      {/* Chevron always visible */}
                      <ChevronDown
                        className={`h-4 w-4 absolute ${paymentFilter ? "right-11" : "right-3"
                          } text-gray-600 pointer-events-none`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuGroup>
                      {paymentMethods?.payload?.data?.map((method) => (
                        <DropdownMenuItem
                          key={method._id}
                          onClick={() => setPaymentFilter(method._id)}
                        >
                          {method.type}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear icon (absolute, clickable) */}
                {paymentFilter && (
                  <button
                    // variant="default"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents dropdown toggle
                      setPaymentFilter("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
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
                        className={`${transaction.type === "income"
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
                      className={`${!(transaction?.expenseCategoryId?.name || transaction?.incomeCategoryId?.name) ? "text-gray-400" : ""
                        }`}
                    >
                      {transaction?.expenseCategoryId?.name || transaction?.incomeCategoryId?.name || "N/A"}
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

export default IncomeExpenseManagement;
