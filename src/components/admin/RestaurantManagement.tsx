import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  Eye,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Filter,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRestaurant,
  getRestaurants,
  updateRestaurant,
} from "@/api/restaurant.api";
import { useToast } from "@/hooks/use-toast";
import { DataTablePagination } from "../common/DataTablePagination";

const RestaurantManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (editingRestaurant) {
      reset({
        name: editingRestaurant.name,
        email: editingRestaurant.email,
        phone: editingRestaurant.phone,
        address: editingRestaurant.address,
      });
      setIsCreateModalOpen(true);
    }
  }, [editingRestaurant, reset]);  

  const { mutate: createRest, isPending } = useMutation({
    mutationKey: ["create-restaurant"],
    mutationFn: createRestaurant,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Restaurant Create",
        description: "Restaurant Created successfully.",
      });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Restaurant Creation failed",
        description: "Failed to create restaurant.",
      });
      console.error("Error creating restaurant:", error);
    },
  });

  const { mutate: updateRest, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-restaurant"],
    mutationFn: ({ id, ...restaurantData }: any) => updateRestaurant(restaurantData, id),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Restaurant Updated",
        description: "Restaurant Updated successfully.",
      });
      setIsCreateModalOpen(false);
      setEditingRestaurant(null);
      reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Restaurant update failed",
        description: "Failed to update restaurant.",
      });
      console.error("Error creating restaurant:", error);
    },
  });

  console.log("filterStatus", filterStatus, filterStatus !== "all" && { status: filterStatus === "active" ? true : false })

  const queryData = {
    search: searchTerm,
    page,
    limit: itemsPerPage,
    ...(filterStatus !== "all" && { status: filterStatus === "active" }),
  };
  const { data: getAllRestaurants } = useQuery({
    queryKey: ["get-all-restaurant", queryData],
    queryFn: () => getRestaurants(queryData),
  });

  const restaurants = getAllRestaurants?.payload?.data || [];
  const totalItems = getAllRestaurants?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const onSubmit = (data: any) => {
    if (editingRestaurant?._id) {
      updateRest({ id: editingRestaurant._id, ...data });
    } else {
      createRest(data);
    }
  };

  const CreateRestaurantModal = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name</Label>
          <Input
            id="name"
            placeholder="Enter restaurant name"
            {...register("name", { required: "Restaurant name is required" })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name.message as string}
            </p>
          )}
        </div>
        {/* <div className="space-y-2">
          <Label htmlFor="managerName">Manager Name</Label>
          <Input id="managerName" name="managerName" placeholder="Manager full name" required />
        </div> */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+91 9876543210"
            {...register("phone", {
              required: "Restaurant contact is required",
            })}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="restaurant@email.com"
            {...register("email", { required: "Restaurant email is required" })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Restaurant Address</Label>
          <Textarea
            id="address"
            placeholder="Complete restaurant address"
            {...register("address", {
              required: "Restaurant address is required",
            })}
          />
          {errors.address && (
            <p className="text-sm text-red-500">
              {errors.address.message as string}
            </p>
          )}
        </div>
        {/* <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine Type</Label>
          <Select name="cuisine">
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north-indian">North Indian</SelectItem>
              <SelectItem value="south-indian">South Indian</SelectItem>
              <SelectItem value="gujarati">Gujarati</SelectItem>
              <SelectItem value="punjabi">Punjabi</SelectItem>
              <SelectItem value="multi-cuisine">Multi Cuisine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Daily Capacity</Label>
          <Input id="capacity" name="capacity" type="number" placeholder="100" required />
        </div> */}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCreateModalOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-primary"
          disabled={isPending || isUpdatePending}
        >
          {(isPending || isUpdatePending) && (
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {editingRestaurant ? "Update Restaurant" : "Create Restaurant"}
        </Button>
      </div>
    </form>
  );

  const RestaurantDetailModal = ({ restaurant }: { restaurant: any }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {restaurant.name} - Restaurant Details
        </DialogTitle>
        <DialogDescription>
          Complete restaurant information and staff attendance overview
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {restaurant.name}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {restaurant.phone}
              </p>
              <p>
                <span className="font-medium">Email:</span> {restaurant.email}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {restaurant.address}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Attendance */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Attendance - Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Ramesh Kumar",
                  role: "Chef",
                  status: "present",
                  checkIn: "9:00 AM",
                },
                {
                  name: "Sunita Devi",
                  role: "Assistant",
                  status: "present",
                  checkIn: "9:15 AM",
                },
                {
                  name: "Vikram Singh",
                  role: "Delivery",
                  status: "late",
                  checkIn: "9:45 AM",
                },
                {
                  name: "Meera Sharma",
                  role: "Helper",
                  status: "absent",
                  checkIn: "-",
                },
              ].map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{staff.checkIn}</span>
                    <Badge
                      variant={
                        staff.status === "present"
                          ? "default"
                          : staff.status === "late"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {staff.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Restaurant Management
          </h1>
          <p className="text-muted-foreground">
            Manage all registered restaurants and their operations
          </p>
        </div>
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) {
              reset();
              setEditingRestaurant(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
              </DialogTitle>
              <DialogDescription>
                {editingRestaurant
                  ? "Update restaurant details"
                  : "Register a new restaurant in the system"}
              </DialogDescription>
            </DialogHeader>
            <CreateRestaurantModal />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search restaurants or managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{restaurants.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Restaurants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {restaurants.filter((r) => r.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-metrics-customers" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Restaurants List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                {/* <TableHead>Manager</TableHead> */}
                <TableHead>Contact</TableHead>
                {/* <TableHead>Customers</TableHead> */}
                {/* <TableHead>Revenue</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {restaurant.address.split(",")[0]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <div>
                      <p className="font-medium">{restaurant.manager}</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.staff} staff members
                      </p>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {restaurant.phone}
                      </p>
                      <p className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {restaurant.email}
                      </p>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{restaurant.customers}</p>
                      <p className="text-xs text-muted-foreground">
                        active customers
                      </p>
                    </div>
                  </TableCell> */}
                  {/* <TableCell>
                    <div>
                      <p className="font-medium">
                        ₹{restaurant.monthlyRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.todayOrders} orders today
                      </p>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          restaurant.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {restaurant.isActive ? (
                          "Active"
                        ) : (
                          "Deactive"
                        )}
                        {restaurant.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <RestaurantDetailModal restaurant={restaurant} />
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRestaurant(restaurant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={
                          restaurant.isActive
                            ? "success"
                            : "destructive"
                        }
                        size="sm"
                      >
                        {restaurant.isActive
                          ? "Activate"
                          : "Deactivate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

export default RestaurantManagement;
