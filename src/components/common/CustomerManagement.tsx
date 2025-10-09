import React, { memo, Suspense, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Eye, Edit, MapPin, Phone, Mail, Calendar, DollarSign, Package, Clock, CheckCircle, XCircle, Pause, Play, User, Loader2 } from "lucide-react";
import { getCustomer, getCustomerOverview, updateCustomer as updateCustomerApi } from "@/api/customer.api";
import { Customer, CustomerResponse, GetCustomerParams, InputOrCustomEvent } from "@/types/customer.types";
import { CustomerForm } from "@/components/common/CustomerForm";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RestaurantData } from "@/api/restaurant.api";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import lodash from "lodash";
import { NoData } from "../common/NoData";
import { getUser } from "@/lib/utils";
import CustomerDetails from "./CustomerDetails";
import { Label } from "../ui/label";
import { getAllArea } from "@/api/area.api";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router";

const CustomerManagement = () => {
  const userRole = getUser();
  const restaurants = useSelector((state: RootState) => state.restaurant);
  const [selectedRestaurent, setSelectedRestaurent] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isActive, setIsActive] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [customers, setCustomers] = useState<{ totalRecords: number; customer: CustomerResponse[] }>({ totalRecords: 0, customer: [] });
  const [customerOverview, setCustomerOverview] = useState<{ totalRecords: number; activeCount: number; pendingDues: number }>({ totalRecords: 0, activeCount: 0, pendingDues: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const {user} = useAuth();
  const {toast} = useToast();
  const queryClient = useQueryClient();

  const [refetch, setRefetch] = useState(false);
  const didMount = useRef(false);
  const didMountOverview = useRef(false);

  const handleDropdownChange = async (e: InputOrCustomEvent) => {
    if (!didMount.current) return;
    const { name, value } = e.target;
    setSelectedRestaurent((prev) => ({
      ...prev,
      [name]: value,
    }));

    // setErrors((prev) => ({
    //   ...prev,
    //   [name]: "",
    // }));
  };

  // Debounce effect for searching
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch customers with TanStack Query
  const { data: customersData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customers", { 
      restaurantId: userRole?.role === "manager" ? userRole?.restaurantId?._id : selectedRestaurent?.restaurantId,
      page,
      limit,
      searchTerm: debouncedSearch,
      isActive
    }],
    queryFn: async () => {
      const queryObj: GetCustomerParams = {
        restaurantId: userRole?.role === "manager" ? userRole?.restaurantId?._id : selectedRestaurent?.restaurantId,
        page,
        limit,
        searchTerm: debouncedSearch,
        isActive: isActive === "all" ? "all" : isActive === "true" ? "true" : "false",
      };
      const response = await getCustomer(queryObj);
      return response?.payload;
    },
    enabled: didMount.current,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local state when query data changes
  useEffect(() => {
    if (customersData) {
      setCustomers(customersData);
    }
  }, [customersData]);

  // Set initial mount after first render
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
    }
  }, []);

  // Fetch customer overview with TanStack Query
  const { data: overviewData } = useQuery({
    queryKey: ["customer-overview", { 
      restaurantId: userRole?.role === "manager" ? userRole?.restaurantId?._id : selectedRestaurent?.restaurantId 
    }],
    queryFn: async () => {
      const restaurantId = userRole?.role === "manager" 
        ? userRole?.restaurantId?._id 
        : selectedRestaurent?.restaurantId;
      
      const response = await getCustomerOverview(restaurantId ? { restaurantId } : {});
      return response?.payload;
    },
    enabled: didMountOverview.current,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local state when overview data changes
  useEffect(() => {
    if (overviewData) {
      setCustomerOverview(overviewData);
    }
  }, [overviewData]);

  // Set initial mount for overview after first render
  useEffect(() => {
    if (!didMountOverview.current) {
      didMountOverview.current = true;
    }
  }, []);

  const totalItems = customers?.totalRecords || 0;
  const totalPages = Math.ceil(totalItems / limit);


  const { data: areasData, isLoading } = useQuery({
    queryKey: ["get-all-area", { 
      restaurantId: user?.restaurantId?._id,
      page: 1,
      limit: 10,
      search: ""
    }],
    queryFn: () =>
      getAllArea({
        restaurantId: user?.restaurantId?._id,
        page: 1,
        limit: 10,
        search: ""
      }),
  });

  
  const areas = areasData?.payload?.data || [];


  const paymentHistory = [
    { date: "2024-11-25", amount: 2500, type: "credit", method: "UPI", description: "Monthly plan payment" },
    { date: "2024-11-20", amount: 500, type: "debit", method: "Cash", description: "Delivery charges" },
    { date: "2024-11-15", amount: 1200, type: "credit", method: "Card", description: "Advance payment" },
    { date: "2024-11-10", amount: 300, type: "debit", method: "UPI", description: "Extra items" },
  ];

  const tiffinInfo = [
    { meal: "Breakfast", items: "2 Paratha, Sabji, Pickle", price: 80, days: "Mon-Sat" },
    { meal: "Lunch", items: "4 Roti, 2 Sabji, Dal, Rice, Salad", price: 150, days: "Mon-Sun" },
    { meal: "Dinner", items: "3 Roti, Sabji, Dal, Pickle", price: 120, days: "Mon-Sat" },
  ];

  const handleDialogOpen = () => {
    setIsCreateModalOpen(true);
  };


  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDialogClosed = () => {
    setEditingCustomer(null);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Customer }) => 
      updateCustomerApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-overview"],
      });
      setIsEditModalOpen(false);
      setIsPending(false);
      toast({
        variant: "default",
        title: "Customer updated",
        description: "Customer updated successfully.",
      })
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      setIsPending(false);
    },
  });

  const editCustomer = () => {
    if (!editingCustomer?._id) return;
    setIsPending(true);
    updateCustomerMutation.mutate({
      id: editingCustomer._id,
      data: editingCustomer
    });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer information, tiffin plans, and payments</p>
        </div>
        
            <Button className="bg-gradient-primary" onClick={() => navigate("/add-tiffin")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
        
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search customers by name, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={isActive === "all" ? "default" : "outline"} onClick={() => setIsActive("all")} size="sm">
                All
              </Button>
              <Button variant={isActive === "true" ? "default" : "outline"} onClick={() => setIsActive("true")} size="sm">
                Active
              </Button>
              <Button variant={isActive === "false" ? "default" : "outline"} onClick={() => setIsActive("false")} size="sm">
                Inactive
              </Button>
              {/* <Button variant={filterStatus === "paused" ? "default" : "outline"} onClick={() => setFilterStatus("paused")} size="sm">
                Paused
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{customerOverview?.totalRecords}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{customerOverview?.activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-metrics-income" />
              <div>
                <p className="flex items-baseline text-2xl font-bold">
                  AED <span>{customerOverview?.totalRevenue ?? 0}</span>{" "}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {/* <Dirham className="w-5 h-5" /> */}AED {customerOverview?.pendingDues}
                </p>
                <p className="text-sm text-muted-foreground">Pending Dues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer List</CardTitle>
            {/* restaurent dropdown */}
            {userRole?.role === "admin" && (
              <div>
                <Select name="restaurantId" onValueChange={(value) => handleDropdownChange({ target: { name: "restaurantId", value } })}>
                  <SelectTrigger id="restaurant">
                    <SelectValue placeholder="Choose a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.data?.map((rest: RestaurantData) => (
                      <SelectItem key={rest._id} value={rest._id}>
                        {rest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  {/* <TableHead>Plan</TableHead> */}
                  {/* <TableHead>Revenue</TableHead> */}
                  <TableHead>Due</TableHead>
                  <TableHead>Today’s Tiffin Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers &&
                  customers?.customer.length > 0 &&
                  customers?.customer?.map((customer) => (
                    <TableRow key={customer?._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {customer?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toLocaleUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{lodash.capitalize(customer?.name ?? "")}</p>
                            <p className="text-sm text-muted-foreground">Ref: {lodash.capitalize(customer?.referenceName ?? "")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{customer?.phone}</p>
                          <p className="text-sm text-muted-foreground">{customer?.email}</p>
                        </div>
                      </TableCell>
                      {/* <TableCell>
                      <div>
                        <p className="font-medium">{customer?.currentPlan}</p>
                        <p className="text-sm text-muted-foreground">{customer?.planType}</p>
                      </div>
                    </TableCell> */}
                      {/* <TableCell>
                      <div>
                        <p className="font-medium text-metrics-income">₹{customer?.totalPaid.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{customer?.totalOrders} orders</p>
                      </div>
                    </TableCell> */}
                      <TableCell>
                        {/* <Badge variant={customer?.pendingDue > 0 ? "destructive" : "default"}>₹{customer?.pendingDue}</Badge> */}
                        <div>-</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer?.tiffinPauseToday == true ? "secondary" : "default"}>
                          {" "}
                          {customer?.tiffinPauseToday == true ? <Pause className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                          {customer?.tiffinPauseToday == true ? "Paused" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {/* <Edit className="h-4 w-4" /> */}
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <CustomerDetails customer={customer} />
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {/* customer list loader */}
                {isLoadingCustomer && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* no data found */}
                {customers?.customer.length === 0 && isLoadingCustomer == false && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <NoData icon={User} title="No customer found" description="Add new customer to manage them here." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* pagination */}
          <DataTablePagination currentPage={page} totalPages={totalPages} totalItems={totalItems} itemsPerPage={limit} startIndex={(page - 1) * limit + 1} endIndex={Math.min(page * limit, totalItems)} hasNextPage={page < totalPages} hasPreviousPage={page > 1} onPageChange={setPage} onNextPage={() => setPage((p) => p + 1)} onPreviousPage={() => setPage((p) => p - 1)} onItemsPerPageChange={setLimit} />
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details below and click "Save" to update.
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCustomer.name || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={editingCustomer.phone || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                    }
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-reference">Reference Name</Label>
                  <Input
                    id="edit-reference"
                    value={editingCustomer.referenceName || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, referenceName: e.target.value })
                    }
                    placeholder="Referred by"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Area *</Label>
                  <Select
                    value={editingCustomer.areaId || ''}
                    onValueChange={(value) =>
                      setEditingCustomer({ ...editingCustomer, areaId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas?.map(area => (
                        <SelectItem key={area._id} value={area._id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address *</Label>
                <textarea
                  id="edit-address"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingCustomer.address || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, address: e.target.value })
                  }
                  placeholder="Full address with landmark"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {editCustomer()}}
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default memo(CustomerManagement);
