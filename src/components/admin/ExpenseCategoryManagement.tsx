import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  usageCount: number;
}

const ExpenseCategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  // Mock data
  const [categories, setCategories] = useState<ExpenseCategory[]>([
    {
      id: 1,
      name: 'Food & Ingredients',
      description: 'Raw materials, vegetables, spices, and other food items',
      status: 'active',
      createdDate: '2024-01-15',
      usageCount: 156
    },
    {
      id: 2,
      name: 'Kitchen Equipment',
      description: 'Cooking utensils, appliances, and kitchen tools',
      status: 'active',
      createdDate: '2024-01-20',
      usageCount: 23
    },
    {
      id: 3,
      name: 'Staff Salaries',
      description: 'Monthly salaries and wages for all staff members',
      status: 'active',
      createdDate: '2024-01-25',
      usageCount: 45
    },
    {
      id: 4,
      name: 'Utilities',
      description: 'Electricity, water, gas, and internet bills',
      status: 'active',
      createdDate: '2024-02-01',
      usageCount: 34
    },
    {
      id: 5,
      name: 'Marketing',
      description: 'Advertising, promotions, and marketing materials',
      status: 'inactive',
      createdDate: '2024-02-10',
      usageCount: 8
    },
    {
      id: 6,
      name: 'Transportation',
      description: 'Delivery vehicles, fuel, and transportation costs',
      status: 'active',
      createdDate: '2024-02-15',
      usageCount: 67
    },
    {
      id: 7,
      name: 'Rent',
      description: 'Restaurant space rent and property taxes',
      status: 'active',
      createdDate: '2024-03-01',
      usageCount: 12
    },
    {
      id: 8,
      name: 'Packaging',
      description: 'Food containers, bags, and packaging materials',
      status: 'active',
      createdDate: '2024-03-10',
      usageCount: 89
    }
  ]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || category.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({ data: filteredCategories, itemsPerPage: 8 });

  const handleCreateCategory = (formData: FormData) => {
    const newCategory: ExpenseCategory = {
      id: Math.max(...categories.map(c => c.id)) + 1,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setCategories([...categories, newCategory]);
    setIsCreateModalOpen(false);
  };

  const handleEditCategory = (formData: FormData) => {
    if (!editingCategory) return;
    
    const updatedCategories = categories.map(category =>
      category.id === editingCategory.id
        ? {
            ...category,
            name: formData.get('name') as string,
            description: formData.get('description') as string
          }
        : category
    );
    setCategories(updatedCategories);
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleToggleStatus = (categoryId: number) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId
        ? { ...category, status: category.status === 'active' ? 'inactive' as const : 'active' as const }
        : category
    );
    setCategories(updatedCategories);
  };

  const handleDeleteCategory = (categoryId: number) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const CategoryFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    category = null,
    title,
    description 
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    category?: ExpenseCategory | null;
    title: string;
    description: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSubmit(formData);
          }}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                defaultValue={category?.name || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter category description"
                defaultValue={category?.description || ''}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {category ? 'Update Category' : 'Create Category'}
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
          <h1 className="text-3xl font-bold text-foreground">Expense Categories</h1>
          <p className="text-muted-foreground">Manage expense categories for better financial tracking</p>
        </div>
        <Button 
          className="bg-gradient-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
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
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tags className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Total Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{categories.filter(c => c.status === 'active').length}</p>
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
                <p className="text-2xl font-bold">{categories.filter(c => c.status === 'inactive').length}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tags className="h-8 w-8 text-metrics-expense" />
              <div>
                <p className="text-2xl font-bold">{categories.reduce((sum, c) => sum + c.usageCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
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
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Usage</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((category) => (
                  <TableRow key={category.id}>
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
                              : category.description
                            }
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
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status === 'active' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <p className="font-medium">{category.usageCount}</p>
                        <p className="text-xs text-muted-foreground">expenses</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">{category.createdDate}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={category.status === 'active' ? 'secondary' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(category.id)}
                        >
                          {category.status === 'active' ? 'Deactivate' : 'Activate'}
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
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCategory(category.id)}
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
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={8}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onPageChange={goToPage}
            onPreviousPage={previousPage}
            onNextPage={nextPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <CategoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        title="Add New Category"
        description="Create a new expense category for better financial tracking"
      />

      {/* Edit Category Modal */}
      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditCategory}
        category={editingCategory}
        title="Edit Category"
        description="Update the expense category information"
      />
    </div>
  );
};

export default ExpenseCategoryManagement;