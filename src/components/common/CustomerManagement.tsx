import React, { memo, Suspense, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Eye, Edit, MapPin, Phone, Mail, Calendar, DollarSign, Package, Clock, CheckCircle, XCircle, Pause, Play, User, Loader2 } from "lucide-react";
import { getCustomer, getCustomerOverview } from "@/api/customer.api";
import { Customer, CustomerResponse, GetCustomerParams, InputOrCustomEvent } from "@/types/customer.types";
// import { CustomerForm } from "../admin/CustomerForm";
import { CustomerForm } from "@/components/common/CustomerForm";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RestaurantData } from "@/api/restaurant.api";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import lodash from "lodash";
import { NoData } from "../common/NoData";
import { Dirham } from "../Svg";
import { getUser } from "@/lib/utils";
import CustomerDetails from "./CustomerDetails";

const CustomerManagement = () => {
  const userRole = getUser();
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    referenceName: "",
    restaurantId: "",
  };
  const restaurants = useSelector((state: RootState) => state.restaurant);
  const [formData, setFormData] = useState<Customer>(initialFormData);
  const [errors, setErrors] = useState<Customer>(initialFormData);
  // const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedRestaurent, setSelectedRestaurent] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isActive, setIsActive] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [customers, setCustomers] = useState<{ totalRecords: number; customer: CustomerResponse[] }>({ totalRecords: 0, customer: [] });
  const [customerOverview, setCustomerOverview] = useState<{ totalRecords: number; activeCount: number; pendingDues: number }>({ totalRecords: 0, activeCount: 0, pendingDues: 0 });
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
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

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const fetchCustomers = async () => {
      setIsLoadingCustomer(true);
      let restaurantId = "";
      restaurantId = selectedRestaurent?.restaurantId || "";
      if (userRole?.role === "manager") {
        restaurantId = userRole?.restaurantId?._id;
      }
      const queryObj = {
        restaurantId,
        page,
        limit,
        searchTerm: debouncedSearch,
        isActive,
      };
      const response = await getCustomer(queryObj as GetCustomerParams);
      if (response?.success) {
        setCustomers(response?.payload);
      }
      setIsLoadingCustomer(false);
    };

    fetchCustomers();
  }, [selectedRestaurent, page, limit, debouncedSearch, isActive, refetch]);

  useEffect(() => {
    if (!didMountOverview.current) {
      didMountOverview.current = true;
      return;
    }

    let restaurantId = "";
    restaurantId = selectedRestaurent?.restaurantId || "";
    if (userRole?.role === "manager") {
      restaurantId = userRole?.restaurantId?._id;
    }
    const getCustomerOverviewData = async () => {
      const response = await getCustomerOverview(restaurantId ? { restaurantId } : {});
      if (response?.success) {
        setCustomerOverview(response?.payload);
      }
    };

    getCustomerOverviewData();
  }, []);

  const totalItems = customers?.totalRecords || 0;
  const totalPages = Math.ceil(totalItems / limit);

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
  const handleDialogClosed = () => {
    // setFormData(initialFormData);
    // setErrors(initialFormData);
    setIsCreateModalOpen(false);
  };

  // const CustomerDetailsModal = ({ customer }: { customer: any }) => (
  //   <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
  //     <DialogHeader>
  //       <DialogTitle className="flex items-center gap-2">
  //         <UserPlus className="h-5 w-5" />
  //         {customer.name} - Customer Details
  //       </DialogTitle>
  //       <DialogDescription>Complete customer information, tiffin details, and payment history</DialogDescription>
  //     </DialogHeader>

  //     <Tabs defaultValue="info" className="w-full">
  //       <TabsList className="grid w-full grid-cols-4">
  //         <TabsTrigger value="info">Customer Info</TabsTrigger>
  //         <TabsTrigger value="tiffin">Tiffin Info</TabsTrigger>
  //         <TabsTrigger value="payment">Payment History</TabsTrigger>
  //         <TabsTrigger value="actions">Actions</TabsTrigger>
  //       </TabsList>

  //       <TabsContent value="info" className="space-y-4">
  //         <Card>
  //           <CardHeader>
  //             <CardTitle className="text-lg">Personal Information</CardTitle>
  //           </CardHeader>
  //           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //             <div className="space-y-3">
  //               <div className="flex items-center space-x-2">
  //                 <Phone className="h-4 w-4 text-muted-foreground" />
  //                 <span>{customer.phone}</span>
  //               </div>
  //               <div className="flex items-center space-x-2">
  //                 <Mail className="h-4 w-4 text-muted-foreground" />
  //                 <span>{customer.email}</span>
  //               </div>
  //               <div className="flex items-center space-x-2">
  //                 <MapPin className="h-4 w-4 text-muted-foreground" />
  //                 <span>{customer.address}</span>
  //               </div>
  //             </div>
  //             <div className="space-y-3">
  //               <p>
  //                 <span className="font-medium">Reference:</span> {customer.reference}
  //               </p>
  //               <p>
  //                 <span className="font-medium">Joined:</span> {customer.joinedDate}
  //               </p>
  //               <p>
  //                 <span className="font-medium">Total Orders:</span> {customer.totalOrders}
  //               </p>
  //               <p>
  //                 <span className="font-medium">Status:</span>
  //                 <Badge variant={customer.status === "active" ? "default" : "secondary"} className="ml-2">
  //                   {customer.status}
  //                 </Badge>
  //               </p>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </TabsContent>

  //       <TabsContent value="tiffin" className="space-y-4">
  //         <Card>
  //           <CardHeader>
  //             <CardTitle className="text-lg">Current Tiffin Plan</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <Table>
  //               <TableHeader>
  //                 <TableRow>
  //                   <TableHead>Meal</TableHead>
  //                   <TableHead>Items</TableHead>
  //                   <TableHead>Price</TableHead>
  //                   <TableHead>Days</TableHead>
  //                 </TableRow>
  //               </TableHeader>
  //               <TableBody>
  //                 {tiffinInfo.map((meal, index) => (
  //                   <TableRow key={index}>
  //                     <TableCell className="font-medium">{meal.meal}</TableCell>
  //                     <TableCell>{meal.items}</TableCell>
  //                     <TableCell>₹{meal.price}</TableCell>
  //                     <TableCell>{meal.days}</TableCell>
  //                   </TableRow>
  //                 ))}
  //               </TableBody>
  //             </Table>
  //             <div className="mt-4 p-4 bg-muted/30 rounded-lg">
  //               <p>
  //                 <span className="font-medium">Plan Type:</span> {customer.planType}
  //               </p>
  //               <p>
  //                 <span className="font-medium">Delivery Charges:</span> {customer.deliveryCharges ? "Yes (₹20/day)" : "No"}
  //               </p>
  //               <p>
  //                 <span className="font-medium">Next Delivery:</span> {customer.nextDelivery}
  //               </p>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </TabsContent>

  //       <TabsContent value="payment" className="space-y-4">
  //         <Card>
  //           <CardHeader>
  //             <div className="flex justify-between items-center">
  //               <CardTitle className="text-lg">Payment History</CardTitle>
  //               <div className="text-right">
  //                 <p className="text-sm text-muted-foreground">Total Paid: ₹{customer.totalPaid}</p>
  //                 <p className="text-sm font-medium text-danger">Pending Due: ₹{customer.pendingDue}</p>
  //               </div>
  //             </div>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-3">
  //               {paymentHistory.map((payment, index) => (
  //                 <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
  //                   <div className="flex items-center space-x-3">
  //                     <div className={`p-2 rounded-lg ${payment.type === "credit" ? "bg-metrics-income/10 text-metrics-income" : "bg-metrics-expense/10 text-metrics-expense"}`}>
  //                       <DollarSign className="h-4 w-4" />
  //                     </div>
  //                     <div>
  //                       <p className="font-medium">{payment.description}</p>
  //                       <p className="text-sm text-muted-foreground">
  //                         {payment.date} • {payment.method}
  //                       </p>
  //                     </div>
  //                   </div>
  //                   <div className={`font-semibold ${payment.type === "credit" ? "text-metrics-income" : "text-metrics-expense"}`}>
  //                     {payment.type === "credit" ? "+" : "-"}₹{payment.amount}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //             {customer.pendingDue > 0 && (
  //               <div className="mt-4">
  //                 <Button className="w-full bg-gradient-primary">
  //                   <DollarSign className="mr-2 h-4 w-4" />
  //                   Receive Due Payment - ₹{customer.pendingDue}
  //                 </Button>
  //               </div>
  //             )}
  //           </CardContent>
  //         </Card>
  //       </TabsContent>

  //       <TabsContent value="actions" className="space-y-4">
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //           <Card>
  //             <CardHeader>
  //               <CardTitle className="text-lg">Quick Actions</CardTitle>
  //             </CardHeader>
  //             <CardContent className="space-y-3">
  //               <Button className="w-full justify-start" variant="outline">
  //                 <Calendar className="mr-2 h-4 w-4" />
  //                 Mark Pause Dates
  //               </Button>
  //               <Button className="w-full justify-start" variant="outline">
  //                 <Package className="mr-2 h-4 w-4" />
  //                 Add/Edit Tiffin Plan
  //               </Button>
  //               <Button className="w-full justify-start" variant="outline">
  //                 <DollarSign className="mr-2 h-4 w-4" />
  //                 Update Payment
  //               </Button>
  //               <Button className="w-full justify-start" variant="outline">
  //                 <Edit className="mr-2 h-4 w-4" />
  //                 Edit Customer Info
  //               </Button>
  //             </CardContent>
  //           </Card>

  //           <Card>
  //             <CardHeader>
  //               <CardTitle className="text-lg">Status Control</CardTitle>
  //             </CardHeader>
  //             <CardContent className="space-y-3">
  //               {customer.status === "active" ? (
  //                 <Button variant="destructive" className="w-full">
  //                   <Pause className="mr-2 h-4 w-4" />
  //                   Pause Service
  //                 </Button>
  //               ) : (
  //                 <Button variant="success" className="w-full">
  //                   <Play className="mr-2 h-4 w-4" />
  //                   Resume Service
  //                 </Button>
  //               )}
  //               <Button variant="outline" className="w-full">
  //                 <XCircle className="mr-2 h-4 w-4" />
  //                 Deactivate Customer
  //               </Button>
  //             </CardContent>
  //           </Card>
  //         </div>
  //       </TabsContent>
  //     </Tabs>
  //   </DialogContent>
  // );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer information, tiffin plans, and payments</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          {/* Render form only when modal is open */}
          <Suspense fallback={<div className="p-4">Loading form...</div>}>
            <CustomerForm open={isCreateModalOpen} onClose={handleDialogClosed} refetch={refetch} setRefetch={setRefetch} />
          </Suspense>
        </Dialog>
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
                                <Edit className="h-4 w-4" />
                                {/* <Eye className="h-4 w-4" /> */}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <CustomerDetails customer={customer} />
                            </DialogContent>
                          </Dialog>
                          {/* <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button> */}
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
    </div>
  );
};
export default memo(CustomerManagement);
