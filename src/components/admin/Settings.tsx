import React, { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, Upload, Bell, Shield, Database, Loader2, Plus, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addSetting, getThresholdAmont, updateSetting } from '@/api/settings.api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { getRestaurants } from '@/api/restaurant.api';
import { Dirham } from '../Svg';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
interface ExpenseThreshold {
  _id: string;
  expenseThresholdAmount: number;
  isActive: boolean;
  restaurantId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Settings = () => {


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<ExpenseThreshold | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [thresholdAmount, setThresholdAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const settingsSchema = z.object({
    // autoBackup: true,
    // emailNotifications: true,
    // smsNotifications: false,
    // defaultPaymentMethod: 'cash', 
    // currency: 'INR',
    // timezone: 'Asia/Kolkata',
    // fiscalYearStart: 'april',
    // taxRate: 18
    _id: z.string().optional(),
    businessName: z.string().min(2, "Business name is required"),
    businessEmail: z.string().min(1, "Email is required").email("Invalid email"),
    businessPhone: z.string().min(10, "Invalid phone number"),
    businessAddress: z.string().min(5, "Address required"),
    expenseThresholdAmount: z.number({ required_error: "Threshold is required", invalid_type_error: "Threshold is required", }).min(1, "Threshold must be greater than 0"),
  });
  type SettingsFormValues = z.infer<typeof settingsSchema>;
  const defaultFormValues: SettingsFormValues = {
    _id: '',
    businessName: 'Restaurant Management System',
    businessEmail: 'admin@restaurant.com',
    businessPhone: '9876543210',
    businessAddress: '123 Business Street, Mumbai, Maharashtra',
    expenseThresholdAmount: 0,
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultFormValues
  });

  const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-red-500 text-sm">{message}</p>;
  };

  const { data: thresholdsData, isPending: isLoading, refetch } = useQuery({
    queryKey: ["get-setting-details", page, pageSize],
    queryFn: () => getThresholdAmont({ page, limit: pageSize }),
  });

  const thresholds = thresholdsData?.payload?.data;

  const { data: restaurantsData } = useQuery({
    queryKey: ["get-all-restaurants"],
    queryFn: () => getRestaurants({}),
  });

 

  const restaurants = restaurantsData?.payload?.data;

  // const handleExportData = () => {
  //   toast({
  //     title: "Data export initiated",
  //     description: "Your data export will be ready shortly.",
  //   });
  // };

  // const handleImportData = () => {
  //   toast({
  //     title: "Data import",
  //     description: "Please select a file to import data.",
  //   });
  // };


  const { mutate: handleUpdate } = useMutation({
    mutationKey: ["update-expense-category"],
    mutationFn: (data: any) => updateSetting(data),
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      refetch();
    },
    onError: (error: unknown) => {
      toast({
        title: "Update failed",
        description: "Failed to update the expense category.",
        variant: "destructive",
      });
      console.error("Error updating expense category:", error);
    },
  });


  const onSubmit = (data: SettingsFormValues) => {
    handleUpdate({ id: data._id, data: { expenseThresholdAmount: data.expenseThresholdAmount }, });
  };

  const handleSaveThreshold = async () => {
    setIsSaving(true);
    try {
      if (editingThreshold) {
        await updateSetting({
          restaurantId: editingThreshold._id,
          expenseThresholdAmount: thresholdAmount
        });
        toast({
          title: "Success",
          description: "Threshold updated successfully",
          variant: "default",
        });
      } else {
        await addSetting({
          restaurantId: selectedRestaurant === "default" ? "" : selectedRestaurant,
          expenseThresholdAmount: thresholdAmount
        });
        toast({
          title: "Success",
          description: "Threshold added successfully",
          variant: "default",
        });
        // Reset to first page when adding a new item
        setPage(1);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Button disabled={!isDirty} onClick={handleSubmit((data) => { onSubmit(data); })} className="gap-2">
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>

      {isLoading ? <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" {...register('businessName')} />
              <FieldError message={errors.businessName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input id="businessEmail" type="email" {...register('businessEmail')} />
              <FieldError message={errors.businessEmail?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input id="businessPhone" {...register('businessPhone')} />
              <FieldError message={errors.businessPhone?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea id="businessAddress" {...register('businessAddress')} />
              <FieldError message={errors.businessAddress?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Financial Settings
              </CardTitle>
              <Button onClick={() => {
                setEditingThreshold(null);
                setSelectedRestaurant("");
                setThresholdAmount(0);
                setIsModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Threshold
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Threshold Amount (AED)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thresholds?.map((threshold) => (
                  <TableRow key={threshold._id}>
                    <TableCell>{threshold.restaurantId?.name || 'Default'}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Dirham size={12} />
                      <span>{threshold.expenseThresholdAmount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${threshold.isActive
                          ? "bg-green-100 border border-green-300 hover:bg-green-200"
                          : "bg-red-100 border border-red-300 hover:bg-red-200"
                          }`}
                      >
                        {threshold.isActive ? "Active" : "Deactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingThreshold(threshold);
                          setSelectedRestaurant(threshold.restaurantId?._id || '');
                          setThresholdAmount(threshold.expenseThresholdAmount);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * pageSize + 1, totalItems)}-
                {Math.min(page * pageSize, totalItems)} of {totalItems} items
              </div>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(p => p - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.ceil(totalItems / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < Math.ceil(totalItems / pageSize)) setPage(p => p + 1);
                      }}
                      className={page >= Math.ceil(totalItems / pageSize) ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </div>
          </CardContent>
        </Card> */}

        {/* System Settings */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Data Management</h4>
              <div className="flex flex-col gap-2">
                <Button onClick={handleExportData} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Export Data
                </Button>
                <Button onClick={handleImportData} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>}

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Security Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                Changes to financial settings like expense thresholds will take effect immediately.
                Make sure to inform all users about these changes to maintain compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingThreshold ? 'Edit Threshold' : 'Add New Threshold'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Restaurant</Label>
              <Select
                value={selectedRestaurant}
                onValueChange={setSelectedRestaurant}
                disabled={!!editingThreshold}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (applies to all restaurants)</SelectItem>
                  {restaurants?.map((restaurant) => (
                    <SelectItem key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Threshold Amount (AED)</Label>
              <Input
                type="number"
                value={thresholdAmount}
                onChange={(e) => setThresholdAmount(Number(e.target.value))}
                placeholder="Enter threshold amount"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleSaveThreshold}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingThreshold ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingThreshold ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;