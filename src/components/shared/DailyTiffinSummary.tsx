import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Utensils,
  Clock,
  FileText,
  MapPin,
  Phone,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  getDailyMealCounts,
  getCustomerSummary,
  exportCustomerSummary,
  CustomerSummary,
  MealCount,
} from "@/api/tiffin.api";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { getAllArea } from "@/api/area.api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const DailyTiffinSummary = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMealType, setSelectedMealType] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const {
    totalPages,
    paginatedData,
    nextPage,
    previousPage,
    goToPage,
    currentPage,
    setCurrentPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  } = usePagination({
    data: customers,
    itemsPerPage: itemsPerPage,
    totalItems: totalItems,
  });

  
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, setCurrentPage]);

  // Separate query parameters for meal summary and customer summary
  const mealSummaryParams = {
    restaurantId: user?.restaurantId?._id,
    date: selectedDate,
  };

  const customerSummaryParams = {
    page: currentPage,
    limit: itemsPerPage,
    date: selectedDate,
    restaurantId: user?.restaurantId?._id,
    // Removed type filter from API params since we're doing client-side filtering
    areaId: selectedArea,
    search: debouncedSearchQuery || undefined,
  };

  // Fetch daily meal summary - only depends on date and restaurantId
  const {
    data: mealSummary,
    isLoading: isMealLoading,
    refetch: refetchMealSummary,
  } = useQuery<MealCount>({
    queryKey: ["daily-meal-counts", mealSummaryParams],
    queryFn: () => getDailyMealCounts(user?.restaurantId?._id!, selectedDate),
    enabled: !!user?.restaurantId?._id,
  });

  // Fetch customer summary - depends on all filter parameters
  const {
    data: customerData,
    isLoading: isCustomerLoading,
    isFetching,
    refetch: refetchCustomerSummary,
  } = useQuery<{ items: CustomerSummary[]; total: number }>({
    queryKey: ["customer-summary", customerSummaryParams],
    queryFn: async () => {
      const data = await getCustomerSummary(customerSummaryParams);
      setCustomers(data?.items || []);
      setTotalItems(data?.total || 0);
      return data;
    },
    enabled: !!user?.restaurantId?._id,
    placeholderData: (previousData) => previousData ?? { items: [], total: 0 },
  });

  // Filter customers based on selected meal type - client-side filtering
  const filteredCustomers = useMemo(() => {
    if (!customers.length) return [];
    
    if (selectedMealType === 'all') {
      return customers;
    }
    
    return customers.filter(customer => {
      const meal = customer[selectedMealType as keyof typeof customer];
      return meal && typeof meal === 'object' && 'mealItems' in meal && 
             Array.isArray(meal.mealItems) && meal.mealItems.length > 0;
    });
  }, [customers, selectedMealType]);

  // Calculate pagination for filtered results
  const paginatedFilteredCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCustomers.slice(0, end);
  }, [filteredCustomers, currentPage, itemsPerPage]);
  
  // Update pagination when filtered results change
  useEffect(() => {
    setTotalItems(filteredCustomers.length);
    // Reset to first page only when meal type changes, not when page changes
    setCurrentPage(1);
  }, [filteredCustomers.length, selectedMealType]);

  const queriesResults = useQueries({
    queries: [
      {
        queryKey: ["get-all-areas"],
        queryFn: () =>
          getAllArea({
            restaurantId: user?.restaurantId?._id,
            page: 1,
            limit: Number.MAX_SAFE_INTEGER,
            search: "",
          }),
      },
    ],
  });

  const [getAllAreaQuery] = queriesResults;

  const { data: areas } = getAllAreaQuery;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "pending":
        return "secondary";
      case "out-for-delivery":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getTotalMeals = () => {
    if (!mealSummary) return 0;
    return mealSummary.totalMeal;
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const exportToPDF = async () => {
    try {
      // Show loading state
      toast.loading('Preparing export...');
      
      // Call the export API with current filters
      const blob = await exportCustomerSummary({
        date: selectedDate,
        type: selectedMealType === 'all' ? '' : selectedMealType,
        areaId: selectedArea,
        search: debouncedSearchQuery,
        restaurantId: user?.restaurantId?._id!,
      });
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set the filename based on current date and filters
      const dateStr = selectedDate.split('-').join('');
      const typeStr = selectedMealType === 'all' ? '' : `-${selectedMealType}`;
      const areaStr = selectedArea ? `-${selectedArea}` : '';
      const searchStr = debouncedSearchQuery ? `-${debouncedSearchQuery.substring(0, 10)}` : '';
      
      link.setAttribute('download', `customer-summary-${dateStr}${typeStr}${areaStr}${searchStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Daily Tiffin Summary
            </h1>
            <p className="text-muted-foreground">
              Track daily meal deliveries and customer orders
            </p>
          </div>
          
          {/* Date Filter */}
          <div className="text-right">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full max-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isMealLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-lg" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Meals
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {Number(getTotalMeals())}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Utensils className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Breakfast
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {mealSummary?.breakfast || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Lunch
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {mealSummary?.lunch || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Utensils className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Dinner
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {mealSummary?.dinner || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>


      {/* Customer Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Customer Deliveries ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {["all", "breakfast", "lunch", "dinner"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedMealType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMealType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedArea || undefined} 
                  onValueChange={(value) => setSelectedArea(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas?.payload?.data?.map((area: any) => (
                      <SelectItem key={area._id} value={area._id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                

                {/* <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[140px]"
                /> */}

                <Button onClick={exportToPDF} variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>


            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Delivery Charge</TableHead>
                    <TableHead>Meal Plans</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isCustomerLoading || isFetching ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`skeleton-${idx}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFilteredCustomers.map((customer: any) => {
                      let areaName = areas?.payload?.data?.find(
                        (area: any) =>
                          area?._id === customer?.customer?.areaId
                      )?.name;
                      return (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {customer?.customer?.name
                                    ?.split(" ")
                                    .map((n: any) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {customer?.customer?.name}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-32">
                                    {customer?.customer?.address}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{areaName}</TableCell>
                          <TableCell>
                            {customer?.deliveryIncluded ? "No" : "Yes"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <DialogTitle>Tiffin Plan Details</DialogTitle>
                                        <DialogDescription className="mt-1">
                                          {customer?.customer?.name} 
                                        </DialogDescription>
                                      </div>
                                      <Badge variant={customer?.isServiceExpired ? 'destructive' : 'default'} className="ml-2">
                                        {customer?.isServiceExpired ? 'Expired' : 'Active'}
                                      </Badge>
                                    </div>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Meal</TableHead>
                                          <TableHead>Meal Quantity</TableHead>
                                          <TableHead>Meal Items</TableHead>
                                          <TableHead>Addons Items</TableHead>
                                          <TableHead>Meal + Addons Price</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                          const meal = customer?.[mealType];
                                          if (!meal?.mealItems?.length) return null;

                                          return (
                                            <TableRow key={mealType}>
                                              <TableCell className="font-medium capitalize">
                                                {mealType}
                                                {meal.mealMenu?.name && (
                                                  <div className="text-xs text-muted-foreground">
                                                    {meal.mealMenu.name}
                                                  </div>
                                                )}
                                              </TableCell>
                                              <TableCell className="font-medium">
                                                {meal.mealQuantity || 1}
                                              </TableCell>
                                              <TableCell>
                                                {meal.mealItems?.map((item, i) => (
                                                  <div key={i}>
                                                    {item.quantity > 1 && `${item.quantity}x `}
                                                    {item.menuDetail?.name}
                                                    {item.price > 0 && ` (₹${item.price}${item.quantity > 1 ? ' each' : ''})`}
                                                  </div>
                                                ))}
                                              </TableCell>
                                              <TableCell>
                                                {meal.addOnItems?.length > 0 ? (
                                                  meal.addOnItems.map((addon, i) => (
                                                    <div key={i}>
                                                      {addon.quantity > 1 && `${addon.quantity}x `}
                                                      {addon.menuDetail?.name}
                                                      {addon.price > 0 && ` (₹${addon.price}${addon.quantity > 1 ? ' each' : ''})`}
                                                    </div>
                                                  ))
                                                ) : (
                                                  <span className="text-muted-foreground">None</span>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <div className="font-medium">
                                                  ₹{meal.mealFinalPrice || 0}
                                                </div>
                                                {meal.deliveryCharge > 0 && (
                                                  <div className="text-xs text-muted-foreground">
                                                    (Includes delivery: ₹{meal.deliveryCharge})
                                                  </div>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>

                                    {/* Order Summary */}
                                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                                      <p>
                                        <span className="font-medium">Tiffin Price:</span> ₹{customer?.tiffinTotalPrice || 0}/-
                                      </p>
                                      <p>
                                        <span className="font-medium">Delivery Included: </span>
                                        <Badge variant={customer?.deliveryIncluded ? "default" : "outline"}>
                                          {customer?.deliveryIncluded ? "Yes" : "No"}
                                        </Badge>
                                      </p>
                                      {customer?.startDate && (
                                        <p>
                                          <span className="font-medium">Start Date: </span>
                                          {new Date(customer.startDate).toLocaleDateString()}
                                        </p>
                                      )}
                                      {customer?.endDate && (
                                        <p>
                                          <span className="font-medium">End Date: </span>
                                          {new Date(customer.endDate).toLocaleDateString()}
                                        </p>
                                      )}
                                      {customer?.remark && (
                                        <p>
                                          <span className="font-medium">Remarks: </span>
                                          {customer.remark}
                                        </p>
                                      )}
                                  </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">
                                        Close
                                      </Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {totalItems > 0 && (
              <div className="mt-4">
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onNextPage={nextPage}
                  onPreviousPage={previousPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTiffinSummary;
