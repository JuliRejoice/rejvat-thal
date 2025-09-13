import React, { useEffect } from 'react';
import { Save, Settings as SettingsIcon, Upload, Bell, Shield, Database, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getThresholdAmont, updateSetting } from '@/api/settings.api';

const Settings = () => {
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

  const { data: getSettingData, isPending: isLoading, refetch } = useQuery({
    queryKey: ["get-setting-details"],
    queryFn: getThresholdAmont,
  });

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
    mutationFn: ({ id, data }: { id: string, data: any }) => updateSetting(id, data),
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
  useEffect(() => {
    if (getSettingData?.payload) {
      reset({ ...defaultFormValues, ...getSettingData.payload, });
    }
  }, [getSettingData, reset]);


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
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseThreshold">Minimum Expense Threshold for Image Upload (₹)</Label>
              <Input id="expenseThreshold" type="number" {...register('expenseThresholdAmount', { valueAsNumber: true })} />
              <FieldError message={errors.expenseThresholdAmount?.message} />
              <p className="text-sm text-muted-foreground">
                Expenses above this amount will require image upload
              </p>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPayment">Default Payment Method</Label>
              <Select value={settings.defaultPaymentMethod} onValueChange={(value) => handleSettingChange('defaultPaymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
              <Select value={settings.fiscalYearStart} onValueChange={(value) => handleSettingChange('fiscalYearStart', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
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
    </div>
  );
};

export default Settings;