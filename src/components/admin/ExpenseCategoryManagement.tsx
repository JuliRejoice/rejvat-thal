import {
  createExpenseCategory,
  getAllExpenseCategory,
  updateExpenseCategory,
} from "@/api/expenseCategory.api";
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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BadgeX,
  CheckCircle,
  Edit,
  Plus,
  Search,
  Tags,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

type ExpenseCat = {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const ExpenseCategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ExpenseCat | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCat | null>(
    null
  );
  const [open, setIsOpen] = useState<boolean>();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (currentCategory) {
      reset({
        name: currentCategory.name ?? "",
        description: currentCategory.description ?? "",
      });
    } else {
      reset({ name: "", description: "" });
    }
  }, [currentCategory, reset]);

  const queryData = {
    search: searchTerm,
    page: page,
    limit: itemsPerPage,
    ...(filterStatus !== "all" && { status: filterStatus === "active" }),
  };

  const {
    data: expenseCatdata,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["get-all-expense-cate", queryData],
    queryFn: () => getAllExpenseCategory(queryData),
  });

  const { mutate: createExpenseCat, isPending: isCreatePending } = useMutation({
    mutationKey: ["create-expense-cat"],
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Expense category create",
        description: "Expense category created successfully.",
      });
      setIsCreateEditModalOpen(false);
      setCurrentCategory(null);
      refetch();
      reset();
    },
    onError: (error) => {
      toast({
        variant: "default",
        title: "Creation failed",
        description: "Expense category creation failed.",
      });
      console.error("Error creating expense category:", error);
    },
  });

  const { mutate: updateExpenseCat, isPending: isUpdatePending } = useMutation({
    mutationKey: ["create-expense-cat"],
    mutationFn: ({ expenseCatdata, id }: any) =>
      updateExpenseCategory(expenseCatdata, id),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Expense category update",
        description: "Expense category updated successfully.",
      });
      setIsCreateEditModalOpen(false);
      setCurrentCategory(null);
      setIsOpen(false);
      refetch();
      reset();
    },
    onError: (error) => {
      toast({
        variant: "default",
        title: "Updation failed",
        description: "Expense category updation failed.",
      });
      console.error("Error creating expense category:", error);
    },
  });

  const categories = expenseCatdata?.payload?.data || [];
  const totalItems = expenseCatdata?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleDeleteCategory = (categoryId: number) => {};

  const onSubmit = (data: any) => {
    if (currentCategory?._id) {
      updateExpenseCat({ expenseCatdata: data, id: currentCategory._id });
    } else {
      createExpenseCat(data);
    }
  };

  const CategoryFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    category = null,
    title,
    description,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    category?: any;
    title: string;
    description: string;
  }) => (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsCreateEditModalOpen(open);
        if (!open) {
          reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter category description"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message as string}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreatePending || isUpdatePending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={isCreatePending || isUpdatePending}
            >
              {category ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Expense Categories
          </h1>
          <p className="text-muted-foreground">
            Manage expense categories for better financial tracking
          </p>
        </div>
        <Button
          className="bg-gradient-primary"
          onClick={() => {
            setCurrentCategory(null);
            setIsCreateEditModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
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
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">
                  Total Categories
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
                  {expenseCatdata?.payload?.active}
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
                  {expenseCatdata?.payload?.deactive}
                </p>
                <p className="text-sm text-muted-foreground">Deactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Categories List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="hidden sm:table-cell">Usage</TableHead> */}
                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Tags className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {category.description.length > 30
                              ? `${category.description.substring(0, 30)}...`
                              : category.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {category.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          category.isActive
                            ? "bg-green-100 border border-green-300 hover:bg-green-200"
                            : "bg-red-100 border border-red-300 hover:bg-red-200"
                        }`}
                      >
                        {category.isActive ? "Active" : "Deactive"}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <p className="font-medium">{category.usageCount}</p>
                        <p className="text-xs text-muted-foreground">
                          expenses
                        </p>
                      </div>
                    </TableCell> */}
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentCategory(category); // category has _id, name, description, isActive
                            setIsCreateEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setIsOpen(true);
                            setSelectedCategory(category);
                          }}
                          className={`${
                            category.isActive
                              ? "bg-green-100 border border-green-300 text-green-500 hover:bg-green-200"
                              : "bg-red-100 border border-red-300 text-red-500 hover:bg-red-200"
                          }`}
                        >
                          {category.isActive ? <BadgeCheck /> : <BadgeX />}
                        </Button>
                        {category.usageCount === 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
            onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <CategoryFormModal
        isOpen={isCreateEditModalOpen}
        // setIsOpen={setIsCreateEditModalOpen}
        onClose={() => {
          setIsCreateEditModalOpen(false);
          setCurrentCategory(null);
          reset();
        }}
        onSubmit={onSubmit}
        category={currentCategory}
        title={currentCategory ? "Edit Category" : "Add New Category"}
        description={
          currentCategory
            ? "Update the expense category information"
            : "Create a new expense category"
        }
      />
      <ConfirmationDialog
        open={open}
        onOpenChange={(open) => {
          if (!isUpdatePending) {
            setIsOpen(open);
          }
        }}
        title={`${
          selectedCategory?.isActive ? "Deactivate" : "Activate"
        } Restaurant`}
        description={`Are you sure you want to ${
          selectedCategory?.isActive ? "deactivate" : "activate"
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
      />
    </div>
  );
};

export default ExpenseCategoryManagement;
