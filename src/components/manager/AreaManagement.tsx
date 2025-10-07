import { DataTablePagination } from "@/components/common/DataTablePagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BadgeX,
  CheckCircle,
  Edit,
  Eye,
  Plus,
  Search,
  Tags,
  Trash2,
  XCircle,
} from "lucide-react";
import { format } from "path";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { SearchableDropDown } from "../common/SearchableDropDown";
import { addNewArea, getAllArea, getAreaOverview, updateArea } from "@/api/area.api";
import { Dirham } from "../Svg";


const AreaManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(
    null
  );
  const [open, setIsOpen] = useState<boolean>();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const { toast } = useToast();
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const { data: areaOverviewData } = useQuery({
    queryKey: ["get-area-overview",{restaurantId: user?.restaurantId?._id}],
    queryFn: () => getAreaOverview({restaurantId: user?.restaurantId?._id}),
  });

  const { data: areasData, isLoading, refetch } = useQuery({
    queryKey: ["get-all-area", { searchTerm, page, itemsPerPage, filterStatus }],
    queryFn: () =>
      getAllArea({
        restaurantId: user?.restaurantId?._id,
        search: searchTerm,
        page,
        limit: itemsPerPage,
      }),
  });

  const { mutate: handleAreaSubmit, isPending } = useMutation({
    mutationKey: ["add-area"],
    mutationFn: addNewArea,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Area created",
        description: "Area created successfully.",
      });
      setIsCreateEditModalOpen(false);
      refetch();
      
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create area. Try again.",
      });
      console.error("Error creating area:", error);
    },
  });

  const { mutate: handleAreaUpdate, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-area"],
    mutationFn: updateArea,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Area updated",
        description: "Area updated successfully.",
      });
      setIsCreateEditModalOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update area. Try again.",
      });
      console.error("Error updating area:", error);
    },
  });

  const areas = areasData?.payload?.data || [];
  const totalItems = areasData?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Area Management
            </h1>
            <p className="text-muted-foreground">
              Manage areas for better financial tracking
            </p>
          </div>
          <Button
            className="bg-gradient-primary"
            onClick={() => setIsCreateEditModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Area
          </Button>

  
          <AreaFormModal
            isOpen={isCreateEditModalOpen}
            onClose={() => {
              setIsCreateEditModalOpen(false);
              setCurrentArea(null);
            }}
            onSubmit={(data) => {
              if (currentArea) {
                handleAreaUpdate({ ...data, id: currentArea._id });
              } else {
                handleAreaSubmit(data);
              }
            }}
            defaultValues={currentArea || undefined}
            isPending={isPending || isUpdatePending}
          />
        </div>

        {/* Search and Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
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
                  variant={filterStatus === "deactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("deactive")}
                  size="sm"
                >
                  Deactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tags className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{areaOverviewData?.payload?.totalAreas}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Areas
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
                    {areaOverviewData?.payload?.activeAreas}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">
                    {areaOverviewData?.payload?.deactiveAreas}
                  </p>
                  <p className="text-sm text-muted-foreground">Deactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Areas Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Area List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Delivery Type</TableHead>
                    <TableHead>Delivery Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : areas?.length > 0 ? (
                    areas.map((area) => (
                      <TableRow key={area._id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell>
                          {area.deliveryType || "Not specified"}
                        </TableCell>
                        <TableCell>
                          {area.deliveryAmount
                            ? `${area.deliveryAmount.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              area.isActive ? "default" : "secondary"
                            }
                          >
                            {area.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedArea(area);
                                setIsViewModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentArea(area);
                                setIsCreateEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Add delete button if needed */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No areas found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination
              currentPage={page}
              totalPages={Math.ceil(areasData?.payload.count / itemsPerPage)}
              totalItems={areasData?.payload.count}
              itemsPerPage={itemsPerPage}
              startIndex={(page - 1) * itemsPerPage + 1}
              endIndex={Math.min(page * itemsPerPage, areasData?.payload.count)}
              hasNextPage={page < Math.ceil(areasData?.payload.count / itemsPerPage)}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
              onNextPage={() => setPage((p) => Math.min(p + 1, 1))}
              onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setPage(1);
              }}
            />
          </CardContent>
        </Card>

        {/* Create Category Modal */}
        {/* <CategoryFormModal
        isOpen={isCreateEditModalOpen}
        // setIsOpen={setIsCreateEditModalOpen}
        onClose={() => {
          setIsCreateEditModalOpen(false);
          setCurrentCategory(null);
          reset();
        }}
        onSubmit={onSubmit}
        category={currentArea}
        title={currentArea ? "Edit Category" : "Add New Category"}
        description={currentArea ? "Update the expense category information" : "Create a new expense category"}
      />
      {/* View Category Model  */}
        {selectedArea && (
          <Dialog
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Area Details</DialogTitle>
                <DialogDescription>
                  View details for {selectedArea.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedArea.name}</p>
                </div>
                <div>
                  <Label>Delivery Type</Label>
                  <p className="font-medium">
                    {selectedArea.deliveryType || "Not specified"}
                  </p>
                </div>
                <div>
                  <Label>Delivery Amount</Label>
                  <p className="font-medium">
                    {selectedArea.deliveryAmount
                      ? `$${selectedArea.deliveryAmount.toFixed(2)}`
                      : "-"}
                  </p>
                </div>

                {selectedArea.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedArea.description}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}



        {/* <ConfirmationDialog
        open={open}
        onOpenChange={(open) => {
          if (!isUpdatePending) {
            setIsOpen(open);
          }
        }}
        title={`${selectedCategory?.isActive ? "Deactivate" : "Activate"
          } Restaurant`}
        description={`Are you sure you want to ${selectedCategory?.isActive ? "deactivate" : "activate"
          } "${selectedCategory?.name}"?`}
        confirmText="Confirm"
        confirmVariant={selectedCategory?.isActive ? "destructive" : "success"}
        isLoading={isUpdatePending}
        onConfirm={() => {
          if (selectedCategory) {
            updateExpenseCat({
              expenseCatdata: {
                isActive: !selectedCategory.isActive,
              },
              id: selectedCategory._id,
            });
          }
        }}
      /> */}

      </div>
    </div>
  );
};

export default AreaManagement;

const AreaFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    restaurantId: string;
    deliveryType: string;
    deliveryAmount: number;
  }) => void;

  defaultValues?: {
    name: string;
    restaurantId: string;
    deliveryType?: string;
    deliveryAmount?: number;
    description?: string;
  };
  isPending: boolean;
}) => {

  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<{
    name: string;
    restaurantId: string;
    deliveryType: 'free' | 'paid';
    deliveryAmount: number;
  }>();
  console.log(defaultValues);
  const deliveryType = watch('deliveryType');

  useEffect(() => {
    if (isOpen && defaultValues) {
      reset({
        name: defaultValues.name || "",
        restaurantId: defaultValues.restaurantId || "",
        deliveryType: (defaultValues.deliveryType as 'free' | 'paid') || "free",
        deliveryAmount: defaultValues.deliveryAmount ?? 0,
      });
    }
  }, [isOpen, defaultValues, reset]);

  const onFormSubmit = (data: {
    name: string;
    restaurantId: string;
    deliveryType: 'free' | 'paid';
    deliveryAmount: number;
  }) => {
    // Convert to the format expected by the parent
    const submitData = {
      name: data.name,
      restaurantId: user?.restaurantId?._id,
      deliveryType: data.deliveryType,
      deliveryAmount: Number(data.deliveryType === 'free' ? '0' : data.deliveryAmount),
    };
    console.log(submitData);
    onSubmit(submitData);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            {defaultValues ? "Update Area" : "Add Area"}
          </DialogTitle>
          <DialogDescription>{defaultValues ? "Update area details" : "Add a new area"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter area name"
                maxLength={40}
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="restaurantId">Restaurant</Label>
              {isManager && user?.restaurantId ? (
                // Show disabled input with manager's restaurant
                <Input
                  value={user.restaurantId.name}
                  disabled
                  className="bg-gray-100"

                />
              ) : (
                <></>
                // Show dropdown for non-managers
                // <SearchableDropDown
                //   options={[
                //     { id: "all", name: "All Restaurants" },
                //     ...(restaurantsOptions.map((restaurant) => ({
                //       id: restaurant.id,
                //       name: restaurant.name,
                //     })) || []),
                //   ]}
                //   value={watch("restaurantId")}
                //   onChange={(value) => {
                //     setValue("restaurantId", value, {
                //       shouldValidate: true,
                //       shouldTouch: true,
                //     });
                //   }}
                // />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Delivery Charge</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="free"
                      {...register("deliveryType")}
                      checked={watch("deliveryType") === "free"}
                      onChange={() => setValue("deliveryType", "free")}
                    />
                    <span className="text-sm text-black">Free Delivery</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="paid"
                      {...register("deliveryType")}
                      checked={watch("deliveryType") === "paid"}
                      onChange={() => setValue("deliveryType", "paid")}
                    />
                    <span className="text-sm text-black">Paid Delivery</span>
                  </label>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="deliveryAmount">Delivery Amount (₹)</Label>
                <Input
                  id="deliveryAmount"
                  type="text"
                  {...register('deliveryAmount', {
                    required: 'Delivery amount is required for paid delivery',
                    pattern: {
                      value: /^[0-9]*$/,
                      message: 'Delivery amount must be a number'
                    },
                    disabled: deliveryType === 'free',
                    value: deliveryType === 'free' ? 0 : Number(watch('deliveryAmount') || 0)
                  })}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    setValue('deliveryAmount', Number(numericValue), { shouldValidate: true });
                  }}
                  value={deliveryType === 'free' ? '0' : (watch('deliveryAmount') || '')}
                  placeholder={deliveryType === 'free' ? 'Free delivery' : 'Enter delivery amount'}
                />
                {errors.deliveryAmount && (
                  <p className="text-sm text-red-500">
                    {errors.deliveryAmount.message as string}
                  </p>
                )}
              </div>

            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={isPending}
            >
              {defaultValues ? isPending ? "Updating..." : "Update Area" : isPending ? "Adding..." : "Add Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

}
